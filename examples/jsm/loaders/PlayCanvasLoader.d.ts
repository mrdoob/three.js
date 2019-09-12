import {
  Loader,
  LoadingManager,
  Group
} from '../../../src/Three';

export class PlayCanvasLoader extends Loader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(json: object): Group;
}
