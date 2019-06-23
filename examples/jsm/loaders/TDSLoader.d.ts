import {
  Color,
  Group,
  LoadingManager,
  Material,
  Mesh,
  Texture
} from '../../../src/Three';

export class TDSLoader {
  constructor(manager?: LoadingManager);
  crossOrigin: string;
  debug: boolean;
  group: Group;
  manager: LoadingManager;
  materials: Material[];
  meshes: Mesh[];
  path: string;
  position: number;
  resourcePath: string;

  load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  setPath(path: string): this;
  setResourcePath(path: string): this;
  setCrossOrigin(path: string): this;
  parse(arraybuffer: ArrayBuffer, path: string): Group;

  debugMessage(message: object): void;
  endChunk(chunk: object): void;
  nextChunk(data: DataView, chunk: object): void;
  readByte(data: DataView): number;
  readChunk(data: DataView): object;
  readColor(data: DataView): Color;
  readDWord(data: DataView): number;
  readFaceArray(data: DataView, mesh: Mesh): void;
  readFile(arraybuffer: ArrayBuffer, path: string): void;
  readFloat(data: DataView): number;
  readInt(data: DataView): number;
  readMap(data: DataView, path: string): Texture;
  readMesh(data: DataView): Mesh;
  readMeshData(data: DataView, path: string): void;
  readMaterialEntry(data: DataView, path: string): void;
  readMaterialGroup(data: DataView): object;
  readNamedObject(data: DataView): void;
  readShort(data: DataView): number;
  readString(data: DataView, maxLength: number): string;
  readWord(data: DataView): number;
  resetPosition(): void;
}
