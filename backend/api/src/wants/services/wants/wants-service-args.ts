import {Knex} from 'knex';
import * as lb from '@google-cloud/logging-bunyan';
import {UsersService} from '../../../users';

interface WantsServiceArgs {
  db: Knex;
  usersService: UsersService;
  logger: lb.express.Logger;
}

export {WantsServiceArgs};
