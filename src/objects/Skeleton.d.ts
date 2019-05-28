import { Bone } from './Bone';
import { Matrix4 } from './../math/Matrix4';
import { DataTexture } from './../textures/DataTexture';

/**
 * @deprecated Use {@link Points THREE.Points} instead.
 */
/**
 * @deprecated Use {@link Points THREE.Points} instead.
 */

export class Skeleton {

	constructor( bones: Bone[], boneInverses?: Matrix4[] );

  /**
   * @deprecated This property has been removed completely.
   */
  useVertexTexture: boolean;
  identityMatrix: Matrix4;
  bones: Bone[];
  boneTextureWidth: number;
  boneTextureHeight: number;
  boneMatrices: Float32Array;
  boneTexture: DataTexture;
  boneInverses: Matrix4[];

  calculateInverses( bone: Bone ): void;
  pose(): void;
  update(): void;
  clone(): this;

}
