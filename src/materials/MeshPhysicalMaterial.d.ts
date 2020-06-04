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

	clearcoat: number;
	clearcoatMap: Texture | null;
	clearcoatRoughness: number;
	clearcoatRoughnessMap: Texture | null;
	clearcoatNormalScale: Vector2;
	clearcoatNormalMap: Texture | null;

	reflectivity: number;

	sheen: Color | null;

	transparency: number;

}
