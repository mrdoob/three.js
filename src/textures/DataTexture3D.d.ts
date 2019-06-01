import { Texture } from './Texture';
import { TypedArray } from '../polyfills';

export class DataTexture3D extends Texture {

	constructor(
		data: ArrayBuffer | TypedArray,
		width: number,
		height: number,
		depth: number
	);

}
