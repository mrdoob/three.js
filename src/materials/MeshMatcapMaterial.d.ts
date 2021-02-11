import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MaterialParameters, Material } from './Material';
import { NormalMapTypes } from '../constants';

export interface MeshMatcapMaterialParameters extends MaterialParameters {

	color?: Color | string | number;
	matcap?: Texture | null;
	map?: Texture | null;
	bumpMap?: Texture | null;
	bumpScale?: number;
	normalMap?: Texture | null;
	normalMapType?: NormalMapTypes;
	normalScale?: Vector2;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	alphaMap?: Texture | null;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshMatcapMaterial extends Material {

	constructor( parameters?: MeshMatcapMaterialParameters );

	/**
	 * @default 'MeshMatcapMaterial'
	 */
	type: string;

	/**
	 * @default { 'MATCAP': '' }
	 */
	defines: { [key: string]: any };

	/**
	 * @default new THREE.Color( 0xffffff )
	 */
	color: Color;

	/**
	 * @default null
	 */
	matcap: Texture | null;

	/**
	 * @default null
	 */
	map: Texture | null;

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
	 * @default new Vector2( 1, 1 )
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
	 * @default null
	 */
	alphaMap: Texture | null;

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

	setValues( parameters: MeshMatcapMaterialParameters ): void;

}
