import {ManagementClient} from 'auth0';
import * as lb from '@google-cloud/logging-bunyan';

interface UsersServiceArgs {
  auth0ManagementClient: ManagementClient;
  logger: lb.express.Logger;
}

export {UsersServiceArgs};
