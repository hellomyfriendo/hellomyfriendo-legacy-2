import dotenv from 'dotenv';

dotenv.config();

import type {Knex} from 'knex';
import {config as appConfig} from './src/config';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    database: appConfig.pg.database,
    host: appConfig.pg.host,
    password: appConfig.pg.password,
    port: appConfig.pg.port,
    user: appConfig.pg.username,
  },
};

module.exports = config;
