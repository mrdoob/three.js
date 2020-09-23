import { MaterialParameters, Material } from './Material';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { NormalMapTypes } from '../constants';

export interface MeshNormalMaterialParameters extends MaterialParameters {

	bumpMap?: Texture | null;
	bumpScale?: number;
	normalMap?: Texture | null;
	normalMapType?: NormalMapTypes;
	normalScale?: Vector2;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshNormalMaterial extends Material {

	constructor( parameters?: MeshNormalMaterialParameters );

	/**
	 * @default 'MeshNormalMaterial'
	 */
	type: string;

	/**
	 * @default null
	 */
	bumpMap: Texture | null;

	/**
	 * @default 1
	 */
	bumpScale: number;

	/**
	 * @default null
	 */
	normalMap: Texture | null;

	/**
	 * @default THREE.TangentSpaceNormalMap
	 */
	normalMapType: NormalMapTypes;

	/**
	 * @default new THREE.Vector2( 1, 1 )
	 */
	normalScale: Vector2;

	/**
	 * @default null
	 */
	displacementMap: Texture | null;

	/**
	 * @default 1
	 */
	displacementScale: number;

	/**
	 * @default 0
	 */
	displacementBias: number;

	/**
	 * @default false
	 */
	wireframe: boolean;

	/**
	 * @default 1
	 */
	wireframeLinewidth: number;

	/**
	 * @default false
	 */
	skinning: boolean;

	/**
	 * @default false
	 */
	morphTargets: boolean;

	/**
	 * @default false
	 */
	morphNormals: boolean;

	setValues( parameters: MeshNormalMaterialParameters ): void;

}
