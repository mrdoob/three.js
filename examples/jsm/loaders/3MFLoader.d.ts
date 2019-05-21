import {
  LoadingManager,
  Group
} from '../../../src/Three';

export class ThreeMFLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  path: string;
  availableExtensions: object[];

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(value: string): this;
  parse(data: ArrayBuffer): Group;
}
