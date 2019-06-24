import {
  Material,
  LoadingManager,
  Group
} from '../../../src/Three';
import {
  MaterialCreator
} from './MTLLoader';

export class OBJLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  materials: MaterialCreator;
  path: string;

  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(data: string) : Group;
  setPath(value: string) : this;
  setMaterials(materials: MaterialCreator) : this;
}
