import {WantVisibility} from './want-visibility';

interface Want {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
  placeId?: string;
  radiusInMeters?: number;
  createdAt: Date;
  updatedAt: Date;
}

export {Want};
