const childProcess = require('child_process');

function run({migrationName}) {
  childProcess.execSync(`knex migrate:make ${migrationName} -x ts`, {
    stdio: 'inherit',
  });
}

module.exports = {
  run,
};
