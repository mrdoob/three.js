import {
  Loader,
  LoadingManager,
  Scene
} from '../../../src/Three';

export class BabylonLoader extends Loader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (scene: Scene) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(json: object): Scene;
}
