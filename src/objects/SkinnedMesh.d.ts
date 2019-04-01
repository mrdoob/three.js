import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Matrix4 } from './../math/Matrix4';
import { Skeleton } from './Skeleton';
import { Mesh } from './Mesh';
import { BufferGeometry } from '../core/BufferGeometry';

export class SkinnedMesh extends Mesh {
  constructor(
    geometry?: Geometry | BufferGeometry,
    material?: Material | Material[],
    useVertexTexture?: boolean
  );

  bindMode: string;
  bindMatrix: Matrix4;
  bindMatrixInverse: Matrix4;
  skeleton: Skeleton;

  bind(skeleton: Skeleton, bindMatrix?: Matrix4): void;
  pose(): void;
  normalizeSkinWeights(): void;
  updateMatrixWorld(force?: boolean): void;
}
