import {WantVisibility} from './want-visibility';

interface Want {
  creatorId: string;
  title: string;
  description?: string;
  visibility: WantVisibility;
}

export {Want};
