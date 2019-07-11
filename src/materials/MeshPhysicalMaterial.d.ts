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
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

	defines: any;
	reflectivity: number;
	clearCoat: number;
	clearCoatRoughness: number;
	clearCoatGeometryNormals?: boolean;

}
