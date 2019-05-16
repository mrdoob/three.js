import {
  BufferGeometry,
  LoadingManager
} from '../../../src/Three';


export class PLYLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  propertyNameMapping: object;
  path: string;

  load(url: string, onLoad: (geometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  setPath(path: string) : this;
  setPropertyNameMapping(mapping: object) : void;

  parse(data: ArrayBuffer | string) : BufferGeometry;
}
