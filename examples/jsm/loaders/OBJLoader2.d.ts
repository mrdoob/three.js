import {
  LoadingManager,
  Group,
  Object3D
} from '../../../src/Three';

import { MaterialHandler } from './obj2/shared/MaterialHandler';
import { MeshReceiver} from './obj2/shared/MeshReceiver';

export class OBJLoader2 {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  logging: {
    enabled: boolean;
    debug: boolean;
  };
  modelName: string;
  instanceNo: number;
  path: string;
  resourcePath: string;
  useIndices: boolean;
  disregardNormals: boolean;
  materialPerSmoothingGroup: boolean;
  useOAsMesh: boolean;
  baseObject3d: Group;
  callbacks: {
    onParseProgress: Function;
    genericErrorHandler: Function;
  };
  materialHandler: MaterialHandler;
  meshReceiver: MeshReceiver;

  addMaterials(materials: object): void;
  load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void, onMeshAlter?: (meshData: object) => void): void;
  parse(content: ArrayBuffer | string): void;
  setLogging(enabled: boolean, debug: boolean): this;
  setModelName(modelName: string): this;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setBaseObject3d(baseObject3d: Object3D): this;
  setUseIndices(useIndices: boolean): this;
  setDisregardNormals(disregardNormals: boolean): this;
  setMaterialPerSmoothingGroup(materialPerSmoothingGroup: boolean): this;
  setUseOAsMesh(useOAsMesh: boolean): this;
  setGenericErrorHandler(genericErrorHandler: Function): void;
}
