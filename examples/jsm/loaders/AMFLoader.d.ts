import {
  LoadingManager,
  Group
} from '../../../src/Three';

export class AMFLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(value: string): this;
  parse(data: ArrayBuffer): Group;
}
