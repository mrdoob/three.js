import {
  Bone,
  BufferGeometry,
  LoadingManager,
  Material,
  Matrix4,
  Mesh,
  Object3D,
  Texture
} from '../../../src/Three';

export class AWDLoader {
  constructor(manager?: LoadingManager);
  manager: LoadingManager;
  materialFactory: any;
  path: string;
  trunk: Object3D;

  getBlock(id: number): any;
  load(url: string, onLoad: (result: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
  loadTexture(url: string): Texture;
  setPath(path: string): this;
  parse(data: ArrayBuffer): Object3D;
  parseAnimatorSet(): object;
  parseAttrValue(type: number, value: number): any;
  parseContainer(): Object3D;
  parseMaterial(): Material;
  parseMatrix4(): Matrix4;
  parseMeshData(): BufferGeometry[];
  parseMeshInstance(): Mesh;
  parseMeshPoseAnimation(poseOnly: boolean): null;
  parseNextBlock(): void;
  parseProperties(expected: object): object;
  parseSkeleton(): Bone[];
  parseSkeletonAnimation(): object[];
  parseSkeletonPose(): Matrix4[];
  parseTexture(): Texture;
  parseUserAttributes(): null;
  parseVertexAnimationSet(): object[];
  readU8(): number;
  readI8(): number;
  readU16(): number;
  readI16(): number;
  readU32(): number;
  readI32(): number;
  readF32(): number;
  readF64(): number;
  readUTF(): string;
  readUTFBytes(len: number): string;
}
