import { LoadingManager } from './LoadingManager.js';

export class AnimationLoader {
  constructor(manager?: LoadingManager);

  manager: LoadingManager;

  load(
    url: string,
    onLoad?: (response: string | ArrayBuffer) => void,
    onProgress?: (request: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): any;
  parse(json: any, onLoad: (response: string | ArrayBuffer) => void): void;
  setPath(path: string): AnimationLoader;
}
