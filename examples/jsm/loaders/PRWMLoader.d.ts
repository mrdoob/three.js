import {
  BufferGeometry,
  LoadingManager
} from '../../../src/Three';


export class PRWMLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  parse(data: ArrayBuffer) : BufferGeometry;

  static isBigEndianPlatform(): boolean;
}
