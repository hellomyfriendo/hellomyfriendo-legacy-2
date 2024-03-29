import {WantVisibility} from '../../../models';

interface CreateWantArgs {
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
  address: string;
  radiusInMeters: number;
}

export {CreateWantArgs};
