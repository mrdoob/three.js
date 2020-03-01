import { Color } from './../math/Color';
import { MaterialParameters, Material } from './Material';

export interface ShadowMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
}

export class ShadowMaterial extends Material {

	constructor( parameters?: ShadowMaterialParameters );

	color: Color;

}
