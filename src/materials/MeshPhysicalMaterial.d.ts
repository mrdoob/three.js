import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import {
	MeshStandardMaterialParameters,
	MeshStandardMaterial,
} from './MeshStandardMaterial';
import { Color } from './../math/Color';

export interface MeshPhysicalMaterialParameters
	extends MeshStandardMaterialParameters {
	reflectivity?: number;
	clearcoat?: number;
	clearcoatRoughness?: number;

	sheen?: Color;

	clearcoatNormalScale?: Vector2;
	clearcoatNormalMap?: Texture | null;
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

	reflectivity: number;
	clearcoat: number;
	clearcoatRoughness: number;

	sheen: Color | null;

	clearcoatNormalScale: Vector2;
	clearcoatNormalMap: Texture | null;

}
