import {Knex} from 'knex';
import {Client as GoogleMapsServicesClient} from '@googlemaps/google-maps-services-js';
import * as lb from '@google-cloud/logging-bunyan';

interface PlacesServiceArgs {
  db: Knex;
  google: {
    maps: {
      client: GoogleMapsServicesClient;
      apiKey: string;
    };
  };
  logger: lb.express.Logger;
}

export {PlacesServiceArgs};
