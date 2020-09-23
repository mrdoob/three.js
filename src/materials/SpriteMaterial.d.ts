import { Color } from './../math/Color';
import { Texture } from './../textures/Texture';
import { MaterialParameters, Material } from './Material';

export interface SpriteMaterialParameters extends MaterialParameters {
	color?: Color | string | number;
	map?: Texture | null;
	alphaMap?: Texture | null;
	rotation?: number;
	sizeAttenuation?: boolean;
}

export class SpriteMaterial extends Material {

	constructor( parameters?: SpriteMaterialParameters );
	/**
	 * @default 'SpriteMaterial'
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
	 * @default 0
	 */
	rotation: number;

	/**
	 * @default true
	 */
	sizeAttenuation: boolean;

	/**
	 * @default true
	 */
	transparent: boolean;

	readonly isSpriteMaterial: true;

	setValues( parameters: SpriteMaterialParameters ): void;
	copy( source: SpriteMaterial ): this;

}
