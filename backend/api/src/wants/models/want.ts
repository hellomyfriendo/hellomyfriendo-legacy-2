import {WantVisibility} from './want-visibility';

interface Want {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
  place: {
    googlePlaceId: string;
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  radiusInMeters: number;
  createdAt: Date;
  updatedAt: Date;
}

export {Want};
