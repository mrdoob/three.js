import {
  Scene,
  LoadingManager
} from '../../../src/Three';

export class VRMLLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;
  resourcePath: string;
  crossOrigin: string;

  load(url: string, onLoad: (scene: Scene) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  setResourcePath(path: string) : this;
  setCrossOrigin(path: string) : this;

  parse(data: string, path: string) : Scene;
}
