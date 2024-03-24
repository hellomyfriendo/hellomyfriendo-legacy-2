import {WantVisibility} from '../../models';

interface CreateWantArgs {
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
}

export {CreateWantArgs};
