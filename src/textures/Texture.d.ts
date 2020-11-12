import { Vector2 } from './../math/Vector2';
import { Matrix3 } from './../math/Matrix3';
import { EventDispatcher } from './../core/EventDispatcher';
import {
	Mapping,
	Wrapping,
	TextureFilter,
	PixelFormat,
	PixelFormatGPU,
	TextureDataType,
	TextureEncoding
} from '../constants';

export class Texture extends EventDispatcher {

	/**
	 * @param [image]
	 * @param [mapping=THREE.Texture.DEFAULT_MAPPING]
	 * @param [wrapS=THREE.ClampToEdgeWrapping]
	 * @param [wrapT=THREE.ClampToEdgeWrapping]
	 * @param [magFilter=THREE.LinearFilter]
	 * @param [minFilter=THREE.LinearMipmapLinearFilter]
	 * @param [format=THREE.RGBAFormat]
	 * @param [type=THREE.UnsignedByteType]
	 * @param [anisotropy=1]
	 * @param [encoding=THREE.LinearEncoding]
	 */
	constructor(
		image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
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

	id: number;
	uuid: string;

	/**
	 * @default ''
	 */
	name: string;
	sourceFile: string;

	/**
	 * @default THREE.Texture.DEFAULT_IMAGE
	 */
	image: any; // HTMLImageElement or ImageData or { width: number, height: number } in some children;

	/**
	 * @default []
	 */
	mipmaps: any[]; // ImageData[] for 2D textures and CubeTexture[] for cube textures;

	/**
	 * @default THREE.Texture.DEFAULT_MAPPING
	 */
	mapping: Mapping;

	/**
	 * @default THREE.ClampToEdgeWrapping
	 */
	wrapS: Wrapping;

	/**
	 * @default THREE.ClampToEdgeWrapping
	 */
	wrapT: Wrapping;

	/**
	 * @default THREE.LinearFilter
	 */
	magFilter: TextureFilter;

	/**
	 * @default THREE.LinearMipmapLinearFilter
	 */
	minFilter: TextureFilter;

	/**
	 * @default 1
	 */
	anisotropy: number;

	/**
	 * @default THREE.RGBAFormat
	 */
	format: PixelFormat;

	internalFormat: PixelFormatGPU | null;

	/**
	 * @default THREE.UnsignedByteType
	 */
	type: TextureDataType;

	/**
	 * @default new THREE.Matrix3()
	 */
	matrix: Matrix3;

	/**
	 * @default true
	 */
	matrixAutoUpdate: boolean;

	/**
	 * @default new THREE.Vector2( 0, 0 )
	 */
	offset: Vector2;

	/**
	 * @default new THREE.Vector2( 1, 1 )
	 */
	repeat: Vector2;

	/**
	 * @default new THREE.Vector2( 0, 0 )
	 */
	center: Vector2;

	/**
	 * @default 0
	 */
	rotation: number;

	/**
	 * @default true
	 */
	generateMipmaps: boolean;

	/**
	 * @default false
	 */
	premultiplyAlpha: boolean;

	/**
	 * @default true
	 */
	flipY: boolean;

	/**
	 * @default 4
	 */
	unpackAlignment: number;

	/**
	 * @default THREE.LinearEncoding
	 */
	encoding: TextureEncoding;

	/**
	 * @default 0
	 */
	version: number;
	needsUpdate: boolean;
	readonly isTexture: true;

	onUpdate: () => void;
	static DEFAULT_IMAGE: any;
	static DEFAULT_MAPPING: any;

	clone(): this;
	copy( source: Texture ): this;
	toJSON( meta: any ): any;
	dispose(): void;
	transformUv( uv: Vector2 ): Vector2;
	updateMatrix(): void;

}
