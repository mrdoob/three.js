import {
  AnimationClip,
  Camera,
  LoadingManager,
  Scene
} from '../../../../src/Three';

export interface GLTF {
  animations: AnimationClip[];
  scene: Scene;
  scenes: Scene[];
  cameras: Camera[];
}

export class LegacyGLTFLoader {
  constructor(manager?: LoadingManager);
  crossOrigin: string;
  manager: LoadingManager;
  path: string;
  resourcePath: string;

  load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setCrossOrigin(value: string): this;
  parse(data: ArrayBuffer | string, path: string, callback: (gltf: GLTF) => void): void;
}
