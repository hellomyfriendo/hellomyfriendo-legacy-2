const {run} = require('./knex-migrate-make');

run({migrationName: process.argv[2]});
