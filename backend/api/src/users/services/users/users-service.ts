import {ManagementApiError} from 'auth0';
import {StatusCodes} from 'http-status-codes';
import {User} from '../../models';
import {UsersServiceArgs} from './interfaces';

class UsersService {
  private readonly auth0ManagementClient;
  private readonly logger;

  constructor(args: UsersServiceArgs) {
    this.auth0ManagementClient = args.auth0ManagementClient;
    this.logger = args.logger;
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const auth0GetUserResponse = await this.auth0ManagementClient.users.get({
        id,
      });

      return {
        id: auth0GetUserResponse.data.user_id,
      };
    } catch (error) {
      if (error instanceof ManagementApiError) {
        if (error.statusCode === StatusCodes.NOT_FOUND) {
          return;
        }
      }

      throw error;
    }
  }
}

export {UsersService};
