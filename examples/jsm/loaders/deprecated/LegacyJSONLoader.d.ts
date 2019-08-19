import {
  Geometry,
  LoadingManager,
  Material
} from '../../../../src/Three';

export interface LegacyJSONLoaderResult {
  geometry: Geometry;
  materials: Material[];
}

export class LegacyJSONLoader {
  constructor(manager?: LoadingManager);
  crossOrigin: string;
  manager: LoadingManager;
  path: string;
  resourcePath: string;
  withCredentials: boolean;

  load(url: string, onLoad: (object: LegacyJSONLoaderResult) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setCrossOrigin(value: string): this;
  setPath(value: string): this;
  setResourcePath(value: string): this;
  parse(json: object, path: string): LegacyJSONLoaderResult;
}
