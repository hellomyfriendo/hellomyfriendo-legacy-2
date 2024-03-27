import {Knex} from 'knex';
import {LanguageServiceClient} from '@google-cloud/language';
import * as lb from '@google-cloud/logging-bunyan';
import {UsersService} from '../../../../users';
import {PlacesService} from '../../../../places';

interface WantsServiceArgs {
  db: Knex;
  googleCloud: {
    language: {
      serviceClient: LanguageServiceClient;
    };
  };
  placesService: PlacesService;
  usersService: UsersService;
  logger: lb.express.Logger;
}

export {WantsServiceArgs};
