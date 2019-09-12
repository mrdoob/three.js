import {
  Object3D,
  Loader,
  LoadingManager
} from '../../../src/Three';

export class AssimpJSONLoader extends Loader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (object: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  parse(json: object, path: string) : Object3D;
}
