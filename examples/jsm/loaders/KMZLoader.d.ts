import {
  LoadingManager
} from '../../../src/Three';

import { Collada } from './ColladaLoader';

export class KMZLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (kmz: Collada) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(value: string): this;
  parse(data: ArrayBuffer): Collada;
}
