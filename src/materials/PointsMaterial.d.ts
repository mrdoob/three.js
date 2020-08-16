import { Material, MaterialParameters } from './Material';
import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';

export interface PointsMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	map?: Texture | null;
	alphaMap?: Texture | null;
	size?: number;
	sizeAttenuation?: boolean;
	morphTargets?: boolean;
}

export class PointsMaterial extends Material {

	constructor( parameters?: PointsMaterialParameters );

	/**
	 * @default 'PointsMaterial'
	 */
	type: string;

	/**
	 * @default new THREE.Color( 0xffffff )
	 */
	color: Color;

	/**
	 * @default null
	 */
	map: Texture | null;

	/**
	 * @default null
	 */
	alphaMap: Texture | null;

	/**
	 * @default 1
	 */
	size: number;

	/**
	 * @default true
	 */
	sizeAttenuation: boolean;

	/**
	 * @default false
	 */
	morphTargets: boolean;

	setValues( parameters: PointsMaterialParameters ): void;

}
