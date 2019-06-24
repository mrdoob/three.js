import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';
import { Combine } from '../constants';
/**
 * parameters is an object with one or more properties defining the material's appearance.
 */
export interface MeshCubeMaterialParameters extends MaterialParameters {
	envMap?: Texture;
	envMapIntensity?: number;
	opacity: number;
}

export class MeshCubeMaterial extends Material {

	constructor( parameters?: MeshCubeMaterialParameters );

	envMap?: Texture;
	envMapIntensity?: number;
	opacity: number;

	setValues( parameters: MeshCubeMaterialParameters ): void;

}
