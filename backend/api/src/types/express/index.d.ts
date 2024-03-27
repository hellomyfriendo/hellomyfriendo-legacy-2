import * as lb from '@google-cloud/logging-bunyan';

export {};

declare global {
  namespace Express {
    export interface Request {
      log: lb.express.Logger;
    }
  }
}
