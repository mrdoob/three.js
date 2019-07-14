import { Texture } from './Texture';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
	TextureEncoding,
} from '../constants';

export class CubeTexture extends Texture {

	constructor(
		images?: any[], // HTMLImageElement or HTMLCanvasElement
		mapping?: Mapping,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		format?: PixelFormat,
		type?: TextureDataType,
		anisotropy?: number,
		encoding?: TextureEncoding
	);

	images: any; // returns and sets the value of Texture.image in the codde ?

}
