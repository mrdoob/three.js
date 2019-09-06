import {
	Loader,
	LoadingManager,
	Object3D,
} from '../../../src/Three';

import { OBJLoader2Parser } from './obj2/worker/parallel/OBJLoader2Parser';
import { MaterialHandler } from './obj2/shared/MaterialHandler';
import { MeshReceiver} from './obj2/shared/MeshReceiver';

export class OBJLoader2 extends Loader {
  constructor(manager?: LoadingManager);
  parser: OBJLoader2Parser;
  modelName: string;
  instanceNo: number;
  path: string;
  resourcePath: string;
  baseObject3d: Object3D;
  materialHandler: MaterialHandler;
  meshReceiver: MeshReceiver;

  setLogging(enabled: boolean, debug: boolean): this;
  setMaterialPerSmoothingGroup(materialPerSmoothingGroup: boolean): this;
  setUseOAsMesh(useOAsMesh: boolean): this;
  setUseIndices(useIndices: boolean): this;
  setDisregardNormals(disregardNormals: boolean): this;

  setModelName(modelName: string): this;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setBaseObject3d(baseObject3d: Object3D): this;
  addMaterials(materials: object): this;

  setCallbackOnAssetAvailable(onAssetAvailable: Function): this;
  setCallbackOnProgress(onProgress: Function): this;
  setCallbackOnError(onError: Function): this;
  setCallbackOnLoad(onLoad: Function): this;
  setCallbackOnMeshAlter(onMeshAlter: Function): this;
  setCallbackOnLoadMaterials(onLoadMaterials: Function): this;

  load(url: string, onLoad: (object3d: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void, onMeshAlter?: (meshData: object) => void): void;
  parse(content: ArrayBuffer | string): Object3D;
}
