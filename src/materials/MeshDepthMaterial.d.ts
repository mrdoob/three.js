import { DepthPackingStrategies } from '../constants';
import { MaterialParameters, Material } from './Material';
import { Texture } from './../textures/Texture';

export interface MeshDepthMaterialParameters extends MaterialParameters {
	depthPacking?: DepthPackingStrategies;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	wireframe?: boolean;
	wireframeLinewidth?: number;
}

export class MeshDepthMaterial extends Material {

	constructor( parameters?: MeshDepthMaterialParameters );

	depthPacking: DepthPackingStrategies;
	displacementMap: Texture | null;
	displacementScale: number;
	displacementBias: number;
	wireframe: boolean;
	wireframeLinewidth: number;

	setValues( parameters: MeshDepthMaterialParameters ): void;

}
