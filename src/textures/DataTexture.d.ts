import { Texture } from './Texture';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
	TextureEncoding,
} from '../constants';
import { TypedArray } from '../polyfills';

export class DataTexture extends Texture {

	constructor(
		data: TypedArray,
		width: number,
		height: number,
		format?: PixelFormat,
		type?: TextureDataType,
		mapping?: Mapping,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		anisotropy?: number,
		encoding?: TextureEncoding
	);

	image: ImageData;

}
