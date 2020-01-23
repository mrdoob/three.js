import { Texture } from './Texture';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
} from '../constants';

export class VideoTexture extends Texture {

	constructor(
		video: HTMLVideoElement,
		mapping?: Mapping,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		format?: PixelFormat,
		type?: TextureDataType,
		anisotropy?: number
	);

	readonly isVideoTexture: true;

}
