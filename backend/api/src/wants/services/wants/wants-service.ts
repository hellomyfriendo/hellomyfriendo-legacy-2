import {GeocodeResult} from '@googlemaps/google-maps-services-js';
import {NotFoundError} from '../../../errors';
import {Want} from '../../models';
import {
  CreateWantArgs,
  FeedWantsArgs,
  WantRow,
  WantsServiceArgs,
} from './interfaces';

class WantsService {
  private readonly db;
  private readonly googleCloud;
  private readonly usersService;
  private readonly logger;

  private readonly wantsTable = 'wants';

  constructor(args: WantsServiceArgs) {
    this.db = args.db;
    this.googleCloud = args.googleCloud;
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

    const geocodeResult = await this.geocodeAddress(args.address);

    const wantInsert: Omit<WantRow, 'id' | 'createdAt' | 'updatedAt'> = {
      creatorId: creator.id,
      title: args.title,
      description: args.description,
      visibility: args.visibility,
      googlePlaceId: geocodeResult.place_id,
      formattedAddress: geocodeResult.formatted_address,
      latitude: geocodeResult.geometry.location.lat,
      longitude: geocodeResult.geometry.location.lng,
      radiusInMeters: args.radiusInMeters,
    };

    this.logger.info({wantInsert}, 'Inserting WantRow');

    const [wantRow] = await this.db<Want>(this.wantsTable)
      .insert(wantInsert)
      .returning('*');

    this.logger.info({want: wantRow}, `Want ${wantRow.id} created!`);

    return wantRow;
  }

  async wantsFeed(args: FeedWantsArgs): Promise<Want[]> {
    const user = await this.usersService.getUser(args.userId);

    if (!user) {
      throw new NotFoundError(`User ${args.userId} not found`);
    }

    const wantRows: WantRow[] = await this.db<WantRow>(this.wantsTable)
      .modify(async queryBuilder => {
        if (args.location) {
          queryBuilder.whereRaw(
            `ST_DWithin(ST_MakePoint(longitude, latitude)::geography, ST_MakePoint(${args.location.longitude}, ${args.location.latitude})::geography, radius_in_meters)`
          );
        }
      })
      .limit(args.limit)
      .offset(args.offset);

    return wantRows.map(this.makeWant);
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

  private async geocodeAddress(address: string): Promise<GeocodeResult> {
    const geocodeResponse = await this.googleCloud.maps.serviceClient.geocode({
      params: {
        address,
        key: this.googleCloud.maps.apiKey,
      },
    });

    return geocodeResponse.data.results[0];
  }

  private makeWant(wantRow: WantRow): Want {
    return {
      id: wantRow.id,
      creatorId: wantRow.creatorId,
      title: wantRow.title,
      description: wantRow.description,
      visibility: wantRow.visibility,
      place: {
        googlePlaceId: wantRow.googlePlaceId,
        formattedAddress: wantRow.formattedAddress,
        location: {
          latitude: wantRow.latitude,
          longitude: wantRow.longitude,
        },
      },
      radiusInMeters: wantRow.radiusInMeters,
      createdAt: wantRow.createdAt,
      updatedAt: wantRow.updatedAt,
    };
  }
}

export {WantsService};
