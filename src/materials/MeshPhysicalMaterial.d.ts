import {
	MeshStandardMaterialParameters,
	MeshStandardMaterial,
} from './MeshStandardMaterial';

export interface MeshPhysicalMaterialParameters
  extends MeshStandardMaterialParameters {
  reflectivity?: number;
  clearCoat?: number;
  clearCoatRoughness?: number;
}

export class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters: MeshPhysicalMaterialParameters );

  defines: any;
  reflectivity: number;
  clearCoat: number;
  clearCoatRoughness: number;

}
