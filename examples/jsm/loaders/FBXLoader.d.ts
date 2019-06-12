import {
  Group,
  LoadingManager
} from '../../../src/Three';

import { TGALoader } from './TGALoader';

export class FBXLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  crossOrigin: string;
  path: string;
  resourcePath: string;
  tgaLoader: TGALoader | null;

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  setResourcePath(path: string) : this;
  setCrossOrigin(value: string): this;
  setTGALoader(tgaLoader: TGALoader): this;

  parse(FBXBuffer: ArrayBuffer | string, path: string) : Group;
}
