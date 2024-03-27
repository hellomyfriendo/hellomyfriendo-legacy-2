import knex, {Knex} from 'knex';
const knexStringcase = require('knex-stringcase');
import {config} from '../config';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    database: config.pg.database,
    host: config.pg.host,
    password: config.pg.password,
    port: config.pg.port,
    user: config.pg.username,
  },
};

const options = knexStringcase(knexConfig);

const db = knex(options);

export {db};
