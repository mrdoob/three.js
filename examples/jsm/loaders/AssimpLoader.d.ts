import {
  Object3D,
  LoadingManager
} from '../../../src/Three';


export interface Assimp {
  animation: any;
  object: Object3D;
}

export class AssimpLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  crossOrigin: string;
  path: string;
  resourcePath: string;

  load(url: string, onLoad: (result: Assimp) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  setResourcePath(path: string) : this;
  setCrossOrigin(value: string): this;
  parse(buffer: ArrayBuffer, path: string) : Assimp;
}
