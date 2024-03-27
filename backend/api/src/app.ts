import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {ManagementClient} from 'auth0';
import {auth} from 'express-oauth2-jwt-bearer';
import * as lb from '@google-cloud/logging-bunyan';
import {LanguageServiceClient} from '@google-cloud/language';
import {Client as GoogleMapsServicesClient} from '@googlemaps/google-maps-services-js';
import {db} from './db';
import {HealthCheckRouter} from './health-check';
import {UsersService} from './users';
import {errorHandler} from './error-handler';
import {config} from './config';
import {WantsRouter, WantsService} from './wants';
import {PlacesService} from './places';

async function createApp() {
  await db.migrate.latest();

  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    logName: config.service.name,
    projectId: config.google.cloud.project.id,
    redirectToStdout: true,
    serviceContext: {
      service: config.service.name,
      version: config.service.version,
    },
    skipParentEntryForCloudRun: true,
  });

  const auth0ManagementClient = new ManagementClient({
    domain: config.auth0.domain,
    clientId: config.auth0.clientId,
    clientSecret: config.auth0.clientSecret,
  });

  const googleLanguageServiceClient = new LanguageServiceClient({
    projectId: config.google.cloud.project.id,
  });

  const googleMapsServiceClient = new GoogleMapsServicesClient();

  const usersService = new UsersService({
    auth0ManagementClient,
    logger,
  });

  const placesService = new PlacesService({
    db,
    google: {
      maps: {
        client: googleMapsServiceClient,
        apiKey: config.google.maps.apiKey,
      },
    },
    logger,
  });

  const wantsService = new WantsService({
    db,
    googleCloud: {
      language: {
        serviceClient: googleLanguageServiceClient,
      },
    },
    placesService,
    usersService,
    logger,
  });

  const checkJwt = auth({
    audience: config.auth0.apiIdentifier,
    issuerBaseURL: `https://${config.auth0.domain}`,
  });

  const healthCheckRouter = new HealthCheckRouter().router;

  const wantsRouter = new WantsRouter({
    checkJwt,
    wantsService,
  }).router;

  const app = express();

  app.use(mw);

  app.use(cors());

  app.use(helmet());

  app.use(express.json());

  app.use('/healthz', healthCheckRouter);

  app.use('/wants', wantsRouter);

  app.use(
    async (
      err: Error,
      req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction
    ) => {
      await errorHandler.handleError(err, req, res);
    }
  );

  return {app, logger};
}

export {createApp};
