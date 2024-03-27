import {GeocodeResult} from '@googlemaps/google-maps-services-js';
import {Place} from '../models';
import {PlaceRow, PlacesServiceArgs} from './interfaces';

class PlacesService {
  private readonly db;
  private readonly google;
  private readonly logger;

  private readonly placesTable = 'places';

  constructor(args: PlacesServiceArgs) {
    this.db = args.db;
    this.google = args.google;
    this.logger = args.logger;
  }

  async getOrCreatePlaceByAddress(address: string): Promise<Place> {
    const geocodeResult = await this.geocodeAddress(address);

    let place = await this.getPlaceByGooglePlaceId(geocodeResult.place_id);

    if (!place) {
      this.logger.info(
        {geocodeResult},
        `Creating place for address: ${address}`
      );

      const [placeRow] = await this.db<PlaceRow>(this.placesTable)
        .insert({
          googlePlaceId: geocodeResult.place_id,
          formattedAddress: geocodeResult.formatted_address,
          latitude: geocodeResult.geometry.location.lat,
          longitude: geocodeResult.geometry.location.lng,
        })
        .returning('*');

      place = this.makePlace(placeRow);
    }

    return place;
  }

  private makePlace(placeRow: PlaceRow): Place {
    return {
      id: placeRow.id,
      formattedAddress: placeRow.formattedAddress,
      geometry: {
        location: {
          latitude: placeRow.latitude,
          longitude: placeRow.longitude,
        },
      },
      createdAt: placeRow.createdAt,
      updatedAt: placeRow.updatedAt,
    };
  }

  private async getPlaceByGooglePlaceId(
    googlePlaceId: string
  ): Promise<Place | undefined> {
    const placeRow = await this.db<PlaceRow>(this.placesTable)
      .where({googlePlaceId})
      .first();

    if (!placeRow) {
      return;
    }

    return;
  }

  private async geocodeAddress(address: string): Promise<GeocodeResult> {
    const geocodeResponse = await this.google.maps.client.geocode({
      params: {
        address,
        key: this.google.maps.apiKey,
      },
    });

    return geocodeResponse.data.results[0];
  }
}

export {PlacesService};
