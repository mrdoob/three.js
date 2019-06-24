import {
  Texture,
  LoadingManager
} from '../../../src/Three';


export class TGALoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (texture: Texture) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;

  parse(data: ArrayBuffer) : Texture;
}
