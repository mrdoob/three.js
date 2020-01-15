import { Bone } from './Bone';
import { Matrix4 } from './../math/Matrix4';
import { DataTexture } from './../textures/DataTexture';

export class Skeleton {

	constructor( bones: Bone[], boneInverses?: Matrix4[] );

	/**
	 * @deprecated This property has been removed completely.
	 */
	useVertexTexture: boolean;
	bones: Bone[];
	boneMatrices: Float32Array;
	boneTexture: undefined | DataTexture;
	boneInverses: Matrix4[];

	calculateInverses( bone: Bone ): void;
	pose(): void;
	update(): void;
	clone(): Skeleton;
	getBoneByName( name: string ): undefined | Bone;

}
