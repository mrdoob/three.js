import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';
import { Combine } from '../constants';

export interface MeshLambertMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	emissive?: Color | string | number;
	emissiveIntensity?: number;
	emissiveMap?: Texture | null;
	map?: Texture | null;
	lightMap?: Texture | null;
	lightMapIntensity?: number;
	aoMap?: Texture | null;
	aoMapIntensity?: number;
	specularMap?: Texture | null;
	alphaMap?: Texture | null;
	envMap?: Texture | null;
	combine?: Combine;
	reflectivity?: number;
	refractionRatio?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
	wireframeLinecap?: string;
	wireframeLinejoin?: string;
	skinning?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshLambertMaterial extends Material {

	constructor( parameters?: MeshLambertMaterialParameters );

	/**
	 * @default 'MeshLambertMaterial'
	 */
	type: string;

	/**
	 * @default new THREE.Color( 0xffffff )
	 */
	color: Color;

	/**
	 * @default new THREE.Color( 0x000000 )
	 */
	emissive: Color;

	/**
	 * @default 1
	 */
	emissiveIntensity: number;

	/**
	 * @default null
	 */
	emissiveMap: Texture | null;

	/**
	 * @default null
	 */
	map: Texture | null;

	/**
	 * @default null
	 */
	lightMap: Texture | null;

	/**
	 * @default 1
	 */
	lightMapIntensity: number;

	/**
	 * @default null
	 */
	aoMap: Texture | null;

	/**
	 * @default 1
	 */
	aoMapIntensity: number;

	/**
	 * @default null
	 */
	specularMap: Texture | null;

	/**
	 * @default null
	 */
	alphaMap: Texture | null;

	/**
	 * @default null
	 */
	envMap: Texture | null;

	/**
	 * @default THREE.MultiplyOperation
	 */
	combine: Combine;

	/**
	 * @default 1
	 */
	reflectivity: number;

	/**
	 * @default 0.98
	 */
	refractionRatio: number;

	/**
	 * @default false
	 */
	wireframe: boolean;

	/**
	 * @default 1
	 */
	wireframeLinewidth: number;

	/**
	 * @default 'round'
	 */
	wireframeLinecap: string;

	/**
	 * @default 'round'
	 */
	wireframeLinejoin: string;

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

	setValues( parameters: MeshLambertMaterialParameters ): void;

}
