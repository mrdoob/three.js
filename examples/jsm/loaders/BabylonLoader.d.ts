import {
  LoadingManager,
  Scene
} from '../../../src/Three';

export class BabylonLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (scene: Scene) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(json: object): Scene;
  setPath(value: string): this;
}
