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

	/**
	 * @param [images=[]]
	 * @param [mapping=THREE.CubeReflectionMapping]
	 * @param [wrapS=THREE.ClampToEdgeWrapping]
	 * @param [wrapT=THREE.ClampToEdgeWrapping]
	 * @param [magFilter=THREE.LinearFilter]
	 * @param [minFilter=THREE.LinearMipmapLinearFilter]
	 * @param [format=THREE.RGBFormat]
	 * @param [type=THREE.UnsignedByteType]
	 * @param [anisotropy=1]
	 * @param [encoding=THREE.LinearEncoding]
	 */
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

	/**
	 * @default false
	 */
	flipY: boolean;

	readonly isCubeTexture: true;

}
