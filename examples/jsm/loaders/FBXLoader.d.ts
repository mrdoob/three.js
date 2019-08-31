import {
  Group,
  Loader,
  LoadingManager
} from '../../../src/Three';

export class FBXLoader extends Loader {
  constructor(manager?: LoadingManager);

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void) : void;
  parse(FBXBuffer: ArrayBuffer | string, path: string) : Group;
}
