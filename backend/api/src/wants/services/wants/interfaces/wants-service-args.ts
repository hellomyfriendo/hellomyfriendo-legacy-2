import {Knex} from 'knex';
import {LanguageServiceClient} from '@google-cloud/language';
import {Client as GoogleMapsServicesClient} from '@googlemaps/google-maps-services-js';
import * as lb from '@google-cloud/logging-bunyan';
import {UsersService} from '../../../../users';

interface WantsServiceArgs {
  db: Knex;
  googleCloud: {
    language: {
      serviceClient: LanguageServiceClient;
    };
    maps: {
      serviceClient: GoogleMapsServicesClient;
      apiKey: string;
    };
  };
  usersService: UsersService;
  logger: lb.express.Logger;
}

export {WantsServiceArgs};
