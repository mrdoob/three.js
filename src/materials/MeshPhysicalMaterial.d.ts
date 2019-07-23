import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import {
	MeshStandardMaterialParameters,
	MeshStandardMaterial,
} from './MeshStandardMaterial';

export interface MeshPhysicalMaterialParameters
	extends MeshStandardMaterialParameters {
	reflectivity?: number;
	clearCoat?: number;
	clearCoatRoughness?: number;

	clearCoatNormalScale?: Vector2;
	clearCoatNormalMap?: Texture;
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

	defines: any;
	reflectivity: number;
	clearCoat: number;
	clearCoatRoughness: number;

	clearCoatNormalScale: Vector2;
	clearCoatNormalMap: Texture | null;

}
