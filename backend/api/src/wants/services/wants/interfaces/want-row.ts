import {WantVisibility} from '../../../models';

interface WantRow {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
  googlePlaceId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  createdAt: Date;
  updatedAt: Date;
}

export {WantRow};
