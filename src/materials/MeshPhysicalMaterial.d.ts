import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import {
	MeshStandardMaterialParameters,
	MeshStandardMaterial,
} from './MeshStandardMaterial';
import { Color } from './../math/Color';

export interface MeshPhysicalMaterialParameters
	extends MeshStandardMaterialParameters {

	clearcoat?: number;
	clearcoatMap?: Texture | null;
	clearcoatRoughness?: number;
	clearcoatRoughnessMap?: Texture | null;
	clearcoatNormalScale?: Vector2;
	clearcoatNormalMap?: Texture | null;

	reflectivity?: number;
	ior?: number;

	sheen?: Color;

	transmission?: number;
	transmissionMap?: Texture | null;

}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

	/**
	 * @default 'MeshPhysicalMaterial'
	 */
	type: string;

	/**
	 * @default { 'STANDARD': '', 'PHYSICAL': '' }
	 */
	defines: { [key: string]: any };

	/**
	 * @default 0
	 */
	clearcoat: number;

	/**
	 * @default null
	 */
	clearcoatMap: Texture | null;

	/**
	 * @default 0
	 */
	clearcoatRoughness: number;

	/**
	 * @default null
	 */
	clearcoatRoughnessMap: Texture | null;

	/**
	 * @default new THREE.Vector2( 1, 1 )
	 */
	clearcoatNormalScale: Vector2;

	/**
	 * @default null
	 */
	clearcoatNormalMap: Texture | null;

	/**
	 * @default 0.5
	 */
	reflectivity: number;

	/**
	 * @default 1.5
	 */
	ior: number;

	/**
	 * @default null
	 */
	sheen: Color | null;

	/**
	 * @default 0
	 */
	transmission: number;

	/**
	 * @default null
	 */
	transmissionMap: Texture | null;

}
