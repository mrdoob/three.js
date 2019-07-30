import {
  LoadingManager
} from '../../../src/Three';

import { GLTFLoader, GLTF } from './GLTFLoader';
import { DRACOLoader } from './DRACOLoader';

export class VRMLoader {
  constructor(manager?: LoadingManager);
  gltfLoader: GLTFLoader;
  manager: LoadingManager;
  path: string;
  resourcePath: string;
  crossOrigin: string;

  load(url: string, onLoad: (scene: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setDRACOLoader(dracoLoader: DRACOLoader): this;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setCrossOrigin(path: string): this;

  parse(gltf: GLTF, onLoad: (scene: GLTF) => void): void;
}
