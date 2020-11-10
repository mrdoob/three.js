import { DepthPackingStrategies } from '../constants';
import { MaterialParameters, Material } from './Material';
import { Texture } from './../textures/Texture';

export interface MeshDepthMaterialParameters extends MaterialParameters {
	map?: Texture | null;
	alphaMap?: Texture | null;
	depthPacking?: DepthPackingStrategies;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
}

export class MeshDepthMaterial extends Material {

	constructor( parameters?: MeshDepthMaterialParameters );

	/**
	 * @default 'MeshDepthMaterial'
	 */
	type: string;

	/**
	 * @default null
	 */
	map: Texture | null;

	/**
	 * @default null
	 */
	alphaMap: Texture | null;

	/**
	 * @default THREE.BasicDepthPacking
	 */
	depthPacking: DepthPackingStrategies;

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
	fog: boolean;

	setValues( parameters: MeshDepthMaterialParameters ): void;

}
