import { Texture } from './Texture';
import { TypedArray } from '../polyfills';
import { TextureFilter } from '../constants';

export class DataTexture3D extends Texture {

	constructor(
		data: TypedArray,
		width: number,
		height: number,
		depth: number
	);

	/**
	 * @default THREE.NearestFilter
	 */
	magFilter: TextureFilter;

	/**
	 * @default THREE.NearestFilter
	 */
	minFilter: TextureFilter;

	/**
	 * @default THREE.ClampToEdgeWrapping
	 */
	wrapR: boolean;

	/**
	 * @default false
	 */
	flipY: boolean;

	/**
	 * @default false
	 */
	generateMipmaps: boolean;

	readonly isDataTexture3D: true;

}
