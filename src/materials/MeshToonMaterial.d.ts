import { Texture } from './../textures/Texture';
import { MeshPhongMaterialParameters, MeshPhongMaterial } from './MeshPhongMaterial';

export interface MeshToonMaterialParameters extends MeshPhongMaterialParameters {
	gradientMap?: Texture | null;
}

export class MeshToonMaterial extends MeshPhongMaterial {

	constructor( parameters?: MeshToonMaterialParameters );

	gradientMap: Texture | null;

	setValues( parameters: MeshToonMaterialParameters ): void;

}
