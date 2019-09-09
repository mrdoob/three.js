import {
  Points,
  Loader,
  LoadingManager
} from '../../../src/Three';


export class PCDLoader extends Loader {
  constructor(manager?: LoadingManager);
  littleEndian: boolean;

  load(url: string, onLoad: (points: Points) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  parse(data: ArrayBuffer | string, url: string) : Points;
}
