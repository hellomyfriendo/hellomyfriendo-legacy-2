import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as lb from '@google-cloud/logging-bunyan';
import {HealthCheckRouter} from './health-check';
import {config} from './config';
import {errorHandler} from './error-handler';

async function createApp() {
  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    logName: config.service.name,
    projectId: config.googleCloud.project.id,
    redirectToStdout: true,
    serviceContext: {
      service: config.service.name,
      version: config.service.version,
    },
    skipParentEntryForCloudRun: true,
  });

  const healthCheckRouter = new HealthCheckRouter().router;

  const app = express();

  app.use(mw);

  app.use(cors());

  app.use(helmet());

  app.use(express.json());

  app.use('/healthz', healthCheckRouter);

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
