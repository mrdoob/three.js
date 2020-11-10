import { Color } from './../math/Color';
import { MaterialParameters, Material } from './Material';

export interface ShadowMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
}

export class ShadowMaterial extends Material {

	constructor( parameters?: ShadowMaterialParameters );

	/**
	 * @default 'ShadowMaterial'
	 */
	type: string;

	/**
	 * @default new THREE.Color( 0x000000 )
	 */
	color: Color;

	/**
	 * @default true
	 */
	transparent: boolean;

}
