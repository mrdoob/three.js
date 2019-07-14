import {
  LoadingManager,
  Group
} from '../../../src/Three';

export class PlayCanvasLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(json: object): Group;
  setPath(value: string): this;
}
