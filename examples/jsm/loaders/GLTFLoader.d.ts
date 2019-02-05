// https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/GLTFLoader.js
import { AnimationClip, Camera, LoadingManager, Scene } from '../../../src/Three';
import { DRACOLoader } from './DRACOLoader';

export class GLTF {
  animations: AnimationClip[];
  scene: Scene;
  scenes: Scene[];
  cameras: Camera[];
  asset: object;
}

export class GLTFLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setCrossOrigin(value: string): void;
  setPath(path: string): GLTFLoader;
  setResourcePath(path: string): GLTFLoader;
  setDRACOLoader(dracoLoader: DRACOLoader): void;
  parse(data: ArrayBuffer, path: string, onLoad: (gltf: GLTF) => void, onError?: (event: ErrorEvent) => void): void;
}
