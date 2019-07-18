import { Texture } from './../textures/Texture';
import { Vector2 } from './../math/Vector2';
import { NormalMapTypes } from '../constants';
import {
	MeshStandardMaterialParameters,
	MeshStandardMaterial,
} from './MeshStandardMaterial';

export interface MeshPhysicalMaterialParameters
	extends MeshStandardMaterialParameters {
	reflectivity?: number;
	clearCoat?: number;
	clearCoatRoughness?: number;
	
	clearCoatGeometryNormals?: boolean;
	clearCoatNormalMap?: Texture;
	clearCoatNormalMapType?: NormalMapTypes;
	clearCoatNormalScale?: Vector2;
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

	defines: any;
	reflectivity: number;
	clearCoat: number;
	clearCoatRoughness: number;

	clearCoatGeometryNormals?: boolean;
	clearCoatNormalMap: Texture | null;
	clearCoatNormalMapType: NormalMapTypes;
	clearCoatNormalScale: Vector2;

}
