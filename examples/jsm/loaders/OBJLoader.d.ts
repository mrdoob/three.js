import {
  Material,
  Loader,
  LoadingManager,
  Group
} from '../../../src/Three';
import {
  MaterialCreator
} from './MTLLoader';

export class OBJLoader extends Loader {
  constructor(manager?: LoadingManager);
  materials: MaterialCreator;

  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(data: string) : Group;
  setMaterials(materials: MaterialCreator) : this;
}
