import {
  Group,
  LoadingManager
} from '../../../src/Three';

export class GCodeLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;
  splitLayer: boolean;

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;

  parse(data: string) : Group;
}
