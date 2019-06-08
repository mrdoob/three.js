import {
  Mesh,
  LoadingManager
} from '../../../src/Three';

export interface XResult {
  animations: object[];
  models: Mesh[];
}

export class VRMLLoader {
  constructor(manager?: LoadingManager);
  crossOrigin: string;
  manager: LoadingManager;
  path: string;
  resourcePath: string;

  load(url: string, onLoad: (object: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setCrossOrigin(path: string): this;
  parse(data: ArrayBuffer | string, onLoad: (object: object) => void): object;
  setPath(path: string): this;
  setResourcePath(path: string): this;
}
