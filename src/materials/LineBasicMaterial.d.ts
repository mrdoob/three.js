import { Color } from './../math/Color';
import { MaterialParameters, Material } from './Material';

export interface LineBasicMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	linewidth?: number;
	linecap?: string;
	linejoin?: string;
	morphTargets?: boolean;
}

export class LineBasicMaterial extends Material {

	constructor( parameters?: LineBasicMaterialParameters );

	/**
	 * @default 'LineBasicMaterial'
	 */
	type: string;

	/**
	 * @default 0xffffff
	 */
	color: Color;

	/**
	 * @default 1
	 */
	linewidth: number;

	/**
	 * @default 'round'
	 */
	linecap: string;

	/**
	 * @default 'round'
	 */
	linejoin: string;

	/**
	 * @default false
	 */
	morphTargets: boolean;

	setValues( parameters: LineBasicMaterialParameters ): void;

}
