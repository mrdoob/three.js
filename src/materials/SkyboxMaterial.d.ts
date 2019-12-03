import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';
/**
 * parameters is an object with one or more properties defining the material's appearance.
 */
export interface SkyboxMaterialParameters extends MaterialParameters {
	envMap?: Texture;
	envMapIntensity?: number;
	opacity: number;
}

export class SkyboxMaterial extends Material {

	constructor( parameters?: SkyboxMaterialParameters );

	envMap?: Texture;
	envMapIntensity?: number;
	opacity: number;
	roughness: number;

	setValues( parameters: SkyboxMaterialParameters ): void;

}
