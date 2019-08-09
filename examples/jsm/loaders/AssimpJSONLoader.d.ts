import {
  Object3D,
  LoadingManager
} from '../../../src/Three';

export class AssimpJSONLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  crossOrigin: string;
  path: string;
  resourcePath: string;

  load(url: string, onLoad: (object: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  setResourcePath(path: string) : this;
  setCrossOrigin(value: string): this;
  parse(json: object, path: string) : Object3D;
}
