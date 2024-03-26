import {NotFoundError} from '../../../errors';
import {Want} from '../../models';
import {CreateWantArgs} from './interfaces/create-want-args';
import {WantsServiceArgs} from './interfaces/wants-service-args';

class WantsService {
  private readonly db;
  private readonly googleCloud;
  private readonly placesService;
  private readonly usersService;
  private readonly logger;

  private readonly wantsTable = 'wants';

  constructor(args: WantsServiceArgs) {
    this.db = args.db;
    this.googleCloud = args.googleCloud;
    this.placesService = args.placesService;
    this.usersService = args.usersService;
    this.logger = args.logger;
  }

  async createWant(args: CreateWantArgs): Promise<Want> {
    this.logger.info({args}, 'Creating Want');

    const creator = await this.usersService.getUser(args.creatorId);

    if (!creator) {
      throw new NotFoundError(`User ${args.creatorId} not found`);
    }

    await this.validateWantTitle(args.title);

    if (args.description) {
      await this.validateWantDescription(args.description);
    }

    let place;

    if (args.address) {
      place = await this.placesService.getOrCreatePlaceByAddress(args.address);
    }

    const wantInsert = {
      creatorId: creator.id,
      title: args.title,
      description: args.description,
      visibility: args.visibility,
      placeId: place?.id,
      radiusInMeters: args.radiusInMeters,
    };

    this.logger.info({wantInsert}, 'Inserting Want');

    const [want] = await this.db<Want>(this.wantsTable)
      .insert(wantInsert)
      .returning('*');

    this.logger.info({want}, `Want ${want.id} created!`);

    return want;
  }

  private async validateWantTitle(title: string) {
    const explicitContentCategory =
      await this.detectTextExplicitContentCategory(title);

    if (explicitContentCategory) {
      throw new RangeError(
        `${explicitContentCategory} detected in title: ${title}. Explicit content is not allowed.`
      );
    }
  }

  private async validateWantDescription(description: string) {
    const explicitContentCategory =
      await this.detectTextExplicitContentCategory(description);

    if (explicitContentCategory) {
      throw new RangeError(
        `${explicitContentCategory} detected in description: ${description}. Explicit content is not allowed.`
      );
    }
  }

  private async detectTextExplicitContentCategory(
    text: string
  ): Promise<string | undefined> {
    const [moderateTextResult] =
      await this.googleCloud.language.serviceClient.moderateText({
        document: {
          type: 'PLAIN_TEXT',
          content: text,
        },
      });

    if (!moderateTextResult.moderationCategories) {
      return;
    }

    const confidenceThreshold = 0.8;
    const excludedCategories = ['Health', 'Legal', 'Religion & Belief'];

    for (const moderationCategory of moderateTextResult.moderationCategories) {
      if (!moderationCategory.name) {
        continue;
      }

      if (excludedCategories.includes(moderationCategory.name)) {
        continue;
      }

      if (!moderationCategory.confidence) {
        continue;
      }

      if (moderationCategory.confidence > confidenceThreshold) {
        return moderationCategory.name;
      }
    }

    return;
  }
}

export {WantsService};
