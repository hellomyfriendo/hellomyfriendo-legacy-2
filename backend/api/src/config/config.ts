import {Joi} from 'celebrate';

const envVarsSchema = Joi.object()
  .keys({
    AUTH0_API_IDENTIFIER: Joi.string().uri().required(),
    AUTH0_CLIENT_ID: Joi.string().required(),
    AUTH0_CLIENT_SECRET: Joi.string().required(),
    AUTH0_DOMAIN: Joi.string().required(),
    GOOGLE_CLOUD_PROJECT_ID: Joi.string().required(),
    GOOGLE_MAPS_API_KEY: Joi.string().required(),
    K_REVISION: Joi.string().required(),
    K_SERVICE: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info').default('info'),
    PGDATABASE: Joi.string().required(),
    PGHOST: Joi.string().required(),
    PGPASSWORD: Joi.string().required(),
    PGPORT: Joi.number().integer().required(),
    PGUSERNAME: Joi.string().required(),
    PORT: Joi.number().integer().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  auth0: {
    apiIdentifier: envVars.AUTH0_API_IDENTIFIER,
    clientId: envVars.AUTH0_CLIENT_ID,
    clientSecret: envVars.AUTH0_CLIENT_SECRET,
    domain: envVars.AUTH0_DOMAIN,
  },
  google: {
    maps: {
      apiKey: envVars.GOOGLE_MAPS_API_KEY,
    },
    cloud: {
      project: {
        id: envVars.GOOGLE_CLOUD_PROJECT_ID,
      },
    },
  },
  logLevel: envVars.LOG_LEVEL,
  pg: {
    database: envVars.PGDATABASE,
    host: envVars.PGHOST,
    password: envVars.PGPASSWORD,
    port: envVars.PGPORT,
    username: envVars.PGUSERNAME,
  },
  port: envVars.PORT,
  service: {
    name: envVars.K_SERVICE,
    version: envVars.K_REVISION,
  },
};

export {config};
