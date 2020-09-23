import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { MaterialParameters, Material } from './Material';
import { NormalMapTypes } from '../constants';

export interface MeshStandardMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	roughness?: number;
	metalness?: number;
	map?: Texture | null;
	lightMap?: Texture | null;
	lightMapIntensity?: number;
	aoMap?: Texture | null;
	aoMapIntensity?: number;
	emissive?: Color | string | number;
	emissiveIntensity?: number;
	emissiveMap?: Texture | null;
	bumpMap?: Texture | null;
	bumpScale?: number;
	normalMap?: Texture | null;
	normalMapType?: NormalMapTypes;
	normalScale?: Vector2;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	roughnessMap?: Texture | null;
	metalnessMap?: Texture | null;
	alphaMap?: Texture | null;
	envMap?: Texture | null;
	envMapIntensity?: number;
	refractionRatio?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
	skinning?: boolean;
	vertexTangents?: boolean;
	morphTargets?: boolean;
	morphNormals?: boolean;
}

export class MeshStandardMaterial extends Material {

	constructor( parameters?: MeshStandardMaterialParameters );

	/**
	 * @default 'MeshStandardMaterial'
	 */
	type: string;

	/**
	 * @default { 'STANDARD': '' }
	 */
	defines: { [key: string]: any };

	/**
	 * @default new THREE.Color( 0xffffff )
	 */
	color: Color;

	/**
	 * @default 1
	 */
	roughness: number;

	/**
	 * @default 0
	 */
	metalness: number;

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
	 * @default null
	 */
	roughnessMap: Texture | null;

	/**
	 * @default null
	 */
	metalnessMap: Texture | null;

	/**
	 * @default null
	 */
	alphaMap: Texture | null;

	/**
	 * @default null
	 */
	envMap: Texture | null;

	/**
	 * @default 1
	 */
	envMapIntensity: number;

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
	vertexTangents: boolean;

	/**
	 * @default false
	 */
	morphTargets: boolean;

	/**
	 * @default false
	 */
	morphNormals: boolean;

	setValues( parameters: MeshStandardMaterialParameters ): void;

}
