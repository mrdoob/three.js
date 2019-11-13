import { MaterialParameters, Material } from './Material';
import { Vector3 } from './../math/Vector3';
import { Texture } from './../textures/Texture';

export interface MeshDistanceMaterialParameters extends MaterialParameters {
	alphaMap?: Texture | null;
	displacementMap?: Texture | null;
	displacementScale?: number;
	displacementBias?: number;
	farDistance?: number;
	nearDistance?: number;
	referencePosition?: Vector3;
}

export class MeshDistanceMaterial extends Material {

	constructor( parameters?: MeshDistanceMaterialParameters );

	alphaMap: Texture | null;
	displacementMap: Texture | null;
	displacementScale: number;
	displacementBias: number;
	farDistance: number;
	nearDistance: number;
	referencePosition: Vector3;

	setValues( parameters: MeshDistanceMaterialParameters ): void;

}
