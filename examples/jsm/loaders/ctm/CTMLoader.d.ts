import {
  BufferGeometry,
  Material
} from '../../../../src/Three';

export interface CTMLoaderParameters {
  basePath?: string;
  offsets?: number[];
  useWorker?: boolean;
  worker?: object;
}

export class CTMLoader {
  constructor();
  workerPath: string;

  load(url: string, onLoad: (geometry: BufferGeometry) => void, parameters: CTMLoaderParameters): void;
  loadParts(url: string, onLoad: (geometries: BufferGeometry[], materials: Material[]) => void, parameters: CTMLoaderParameters): void;
  setWorkerPath(value: string): this;
}
