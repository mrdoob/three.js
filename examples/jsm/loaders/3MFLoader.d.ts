import {
  Loader,
  LoadingManager,
  Group
} from '../../../src/Three';

export class ThreeMFLoader extends Loader {
  constructor(manager?: LoadingManager);
  availableExtensions: object[];

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(data: ArrayBuffer): Group;
  addExtension(extension: object):void
}
