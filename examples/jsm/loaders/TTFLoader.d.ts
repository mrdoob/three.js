import {
  BufferGeometry,
  LoadingManager
} from '../../../src/Three';

export class TTFLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;
  reversed: boolean;

  load(url: string, onLoad: (json: object) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(path: string): this;

  parse(arraybuffer: ArrayBuffer): object;
}
