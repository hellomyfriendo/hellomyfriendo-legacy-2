import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as lb from '@google-cloud/logging-bunyan';
import {HealthCheckRouter} from './health-check';
import {config} from './config';

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

  return {app, logger};
}

export {createApp};
