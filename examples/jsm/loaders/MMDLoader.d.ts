import {
  AnimationClip,
  FileLoader,
  LoadingManager,
  SkinnedMesh
} from '../../../src/Three';

export interface MMDLoaderAnimationObject {
  animation: AnimationClip;
  mesh: SkinnedMesh;
}

export class MMDLoader {
  constructor(manager?: LoadingManager);
  animationBuilder: object;
  animationPath: string;
  crossOrigin: string;
  loader: FileLoader;
  manager: LoadingManager;
  meshBuilder: object;
  path: string;
  parser: object | null;
  resourcePath: string;

  load(url: string, onLoad: (mesh: SkinnedMesh) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadAnimation(url: string, onLoad: (object: SkinnedMesh | AnimationClip) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadPMD(url: string, onLoad: (object: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadPMX(url: string, onLoad: (object: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadVMD(url: string, onLoad: (object: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadVPD(url: string, onLoad: (object: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadWithAnimation(url: string, vmdUrl: string | string[], onLoad: (object: MMDLoaderAnimationObject) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setAnimationPath(animationPath: string): this;
  setCrossOrigin(crossOrigin: string): this;
  setPath(path: string): this;
  setResoucePath(resourcePath: string): this;
}
