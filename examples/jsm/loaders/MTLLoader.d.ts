// https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/MTLLoader.js

import { BufferGeometry, EventDispatcher, LoadingManager, Material, Texture } from '../../../src/Three';

export class MTLLoader extends EventDispatcher {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  materialOptions: {};
  materials: Material[];
  path: string;
  texturePath: string;
  crossOrigin: boolean;

  load(url: string, onLoad: (materialCreator: MaterialCreator) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  parse(text: string): MaterialCreator;
  setPath(path: string): void;
  setTexturePath(path: string): void;
  setBaseUrl(path: string): void;
  setCrossOrigin(value: boolean): void;
  setMaterialOptions(value: any): void;
}

export class MaterialCreator {
  constructor(baseUrl?: string, options?: any);

  baseUrl: string;
  options: any;
  materialsInfo: any;
  materials: any;
  materialsArray: Material[];
  nameLookup: any;
  side: number;
  wrap: number;

  setCrossOrigin(value: boolean): void;
  setManager(value: any): void;
  setMaterials(materialsInfo: any): void;
  convert(materialsInfo: any): any;
  preload(): void;
  getIndex(materialName: string): Material;
  getAsArray(): Material[];
  create(materialName: string): Material;
  createMaterial_(materialName: string): Material;
  getTextureParams(value: string, matParams: any): any;
  loadTexture(url: string, mapping: any, onLoad: (bufferGeometry: BufferGeometry) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): Texture;
}
