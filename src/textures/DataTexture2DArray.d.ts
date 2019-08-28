import { Texture } from './Texture';
import { TypedArray } from '../polyfills';

export class DataTexture2DArray extends Texture {

	constructor(
		data: TypedArray,
		width: number,
		height: number,
		depth: number
	);

}
