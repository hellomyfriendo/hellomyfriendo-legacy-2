import {NotFoundError} from '../../../errors';
import {Want} from '../../models';
import {CreateWantArgs} from './create-want-args';
import {WantsServiceArgs} from './wants-service-args';

class WantsService {
  private readonly db;
  private readonly usersService;
  private readonly logger;

  constructor(args: WantsServiceArgs) {
    this.db = args.db;
    this.usersService = args.usersService;
    this.logger = args.logger;
  }

  async createWant(args: CreateWantArgs): Promise<Want> {
    const creator = await this.usersService.getUser(args.creatorId);

    if (!creator) {
      throw new NotFoundError(`User ${args.creatorId} not found`);
    }

    return {
      creatorId: creator.id,
      title: args.title,
      description: args.description,
      visibility: args.visibility,
    };
  }
}

export {WantsService};
