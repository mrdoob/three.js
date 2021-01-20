import { Texture } from './Texture';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	PixelFormat,
	TextureDataType,
} from '../constants';

export class CanvasTexture extends Texture {

	/**
	 * @param canvas
	 * @param [format=THREE.RGBAFormat]
	 * @param [type=THREE.UnsignedByteType]
	 * @param [mapping=THREE.Texture.DEFAULT_MAPPING]
	 * @param [wrapS=THREE.ClampToEdgeWrapping]
	 * @param [wrapT=THREE.ClampToEdgeWrapping]
	 * @param [magFilter=THREE.LinearFilter]
	 * @param [minFilter=THREE.LinearMipmapLinearFilter]
	 * @param [anisotropy=1]
	 * @param [encoding=THREE.LinearEncoding]
	 */
	constructor(
		canvas: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
		mapping?: Mapping,
		wrapS?: Wrapping,
		wrapT?: Wrapping,
		magFilter?: TextureFilter,
		minFilter?: TextureFilter,
		format?: PixelFormat,
		type?: TextureDataType,
		anisotropy?: number
	);

	readonly isCanvasTexture: true;

}
