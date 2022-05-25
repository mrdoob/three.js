import {
	FloatType,
	HalfFloatType,
	UnsignedByteType,
	RGBAFormat,
	RGFormat,
	RGIntegerFormat,
	RedFormat,
	RedIntegerFormat,
	LinearEncoding,
	sRGBEncoding,
	DataTexture,
	REVISION,
} from 'three';

import {
	write,
	KTX2Container,
	KHR_DF_CHANNEL_RGBSDA_ALPHA,
	KHR_DF_CHANNEL_RGBSDA_BLUE,
	KHR_DF_CHANNEL_RGBSDA_GREEN,
	KHR_DF_CHANNEL_RGBSDA_RED,
	KHR_DF_MODEL_RGBSDA,
	KHR_DF_PRIMARIES_BT709,
	KHR_DF_SAMPLE_DATATYPE_FLOAT,
	KHR_DF_SAMPLE_DATATYPE_LINEAR,
	KHR_DF_SAMPLE_DATATYPE_SIGNED,
	KHR_DF_TRANSFER_LINEAR,
	KHR_DF_TRANSFER_SRGB,
	VK_FORMAT_R16_SFLOAT,
	VK_FORMAT_R16G16_SFLOAT,
	VK_FORMAT_R16G16B16A16_SFLOAT,
	VK_FORMAT_R32_SFLOAT,
	VK_FORMAT_R32G32_SFLOAT,
	VK_FORMAT_R32G32B32A32_SFLOAT,
	VK_FORMAT_R8_SRGB,
	VK_FORMAT_R8_UNORM,
	VK_FORMAT_R8G8_SRGB,
	VK_FORMAT_R8G8_UNORM,
	VK_FORMAT_R8G8B8A8_SRGB,
	VK_FORMAT_R8G8B8A8_UNORM,
 } from '../libs/ktx-parse.module.js';

const VK_FORMAT_MAP = {

	[RGBAFormat]: {
		[FloatType]: {
			[LinearEncoding]: VK_FORMAT_R32G32B32A32_SFLOAT,
		},
		[HalfFloatType]: {
			[LinearEncoding]: VK_FORMAT_R16G16B16A16_SFLOAT,
		},
		[UnsignedByteType]: {
			[LinearEncoding]: VK_FORMAT_R8G8B8A8_UNORM,
			[sRGBEncoding]: VK_FORMAT_R8G8B8A8_SRGB,
		},
	},

	[RGFormat]: {
		[FloatType]: {
			[LinearEncoding]: VK_FORMAT_R32G32_SFLOAT,
		},
		[HalfFloatType]: {
			[LinearEncoding]: VK_FORMAT_R16G16_SFLOAT,
		},
		[UnsignedByteType]: {
			[LinearEncoding]: VK_FORMAT_R8G8_UNORM,
			[sRGBEncoding]: VK_FORMAT_R8G8_SRGB,
		},
	},

	[RedFormat]: {
		[FloatType]: {
			[LinearEncoding]: VK_FORMAT_R32_SFLOAT,
		},
		[HalfFloatType]: {
			[LinearEncoding]: VK_FORMAT_R16_SFLOAT,
		},
		[UnsignedByteType]: {
			[LinearEncoding]: VK_FORMAT_R8_SRGB,
			[sRGBEncoding]: VK_FORMAT_R8_UNORM,
		},
	},

};

const KHR_DF_CHANNEL_MAP = {

	0: KHR_DF_CHANNEL_RGBSDA_RED,
	1: KHR_DF_CHANNEL_RGBSDA_GREEN,
	2: KHR_DF_CHANNEL_RGBSDA_BLUE,
	3: KHR_DF_CHANNEL_RGBSDA_ALPHA,

};

const ERROR_INPUT = 'THREE.KTX2Exporter: Supported inputs are DataTexture, Data3DTexture, or WebGLRenderer and WebGLRenderTarget.';
const ERROR_FORMAT = 'THREE.KTX2Exporter: Supported formats are RGBAFormat, RGFormat, or RedFormat.';
const ERROR_TYPE = 'THREE.KTX2Exporter: Supported types are FloatType, HalfFloatType, or UnsignedByteType."';
const ERROR_ENCODING = 'THREE.KTX2Exporter: Supported encodings are sRGB (UnsignedByteType only) or Linear.';

export class KTX2Exporter {

	parse( arg1, arg2 ) {

		let texture;

		if ( arg1.isDataTexture || arg1.isData3DTexture ) {

			texture = arg1;

		} else if ( arg1.isWebGLRenderer && arg2.isWebGLRenderTarget ) {

			texture = toDataTexture( arg1, arg2 );

		} else {

			throw new Error( ERROR_INPUT );

		}

		if ( VK_FORMAT_MAP[ texture.format ] === undefined ) {

			throw new Error( ERROR_FORMAT );

		}

		if ( VK_FORMAT_MAP[ texture.format ][ texture.type ] === undefined ) {

			throw new Error( ERROR_TYPE );

		}

		if ( VK_FORMAT_MAP[ texture.format ][ texture.type ][ texture.encoding ] === undefined ) {

			throw new Error( ERROR_ENCODING );

		}

		//

		const array = texture.image.data;
		const channelCount = getChannelCount( texture );
		const container = new KTX2Container();

		container.vkFormat = VK_FORMAT_MAP[ texture.format ][ texture.type ][ texture.encoding ];
		container.typeSize = array.BYTES_PER_ELEMENT;
		container.pixelWidth = texture.image.width;
		container.pixelHeight = texture.image.height;

		if ( texture.isData3DTexture ) {

			container.pixelDepth = texture.image.depth;

		}

		//

		const basicDesc = container.dataFormatDescriptor[ 0 ];

		// TODO: After `texture.encoding` is replaced, distinguish between
		// non-color data (unspecified model and primaries) and sRGB or Linear-sRGB colors.
		basicDesc.colorModel = KHR_DF_MODEL_RGBSDA;
		basicDesc.colorPrimaries = KHR_DF_PRIMARIES_BT709;
		basicDesc.transferFunction = texture.encoding === sRGBEncoding
			? KHR_DF_TRANSFER_SRGB
			: KHR_DF_TRANSFER_LINEAR;

		basicDesc.texelBlockDimension = [ 0, 0, 0, 0 ];

		basicDesc.bytesPlane = [

			container.typeSize * channelCount, 0, 0, 0, 0, 0, 0, 0,

		];

		for ( let i = 0; i < channelCount; ++ i ) {

			let channelType = KHR_DF_CHANNEL_MAP[ i ];

			if ( texture.encoding === LinearEncoding ) {

				channelType |= KHR_DF_SAMPLE_DATATYPE_LINEAR;

			}

			if ( texture.type === FloatType || texture.type === HalfFloatType ) {

				channelType |= KHR_DF_SAMPLE_DATATYPE_FLOAT;
				channelType |= KHR_DF_SAMPLE_DATATYPE_SIGNED;

			}

			basicDesc.samples.push( {

				channelType: channelType,
				bitOffset: i * array.BYTES_PER_ELEMENT,
				bitLength: array.BYTES_PER_ELEMENT * 8 - 1,
				samplePosition: [0, 0, 0, 0],
				sampleLower: texture.type === UnsignedByteType ? 0 : -1,
				sampleUpper: texture.type === UnsignedByteType ? 255 : 1,

			} );

		}

		//

		container.levels = [ {

			levelData: new Uint8Array( array.buffer, array.byteOffset, array.byteLength ),
			uncompressedByteLength: array.byteLength,

		} ];

		//

		container.keyValue['KTXwriter'] = `three.js ${ REVISION }`;

		//

		return write( container, { keepWriter: true } );

	}

}

function toDataTexture( renderer, rtt ) {

	const channelCount = getChannelCount( rtt.texture );

	let view;

	if ( rtt.texture.type === FloatType ) {

		view = new Float32Array( rtt.width * rtt.height * channelCount );

	} else if ( rtt.texture.type === HalfFloatType ) {

		view = new Uint16Array( rtt.width * rtt.height * channelCount );

	} else if ( rtt.texture.type === UnsignedByteType ) {

		view = new Uint8Array( rtt.width * rtt.height * channelCount );

	} else {

		throw new Error( ERROR_TYPE );

	}

	renderer.readRenderTargetPixels( rtt, 0, 0, rtt.width, rtt.height, view );

	return new DataTexture( view, rtt.width, rt.height, rtt.texture.format, rtt.texture.type );

}

function getChannelCount( texture ) {

	switch ( texture.format ) {

		case RGBAFormat:

			return 4;

		case RGFormat:
		case RGIntegerFormat:

			return 2;

		case RedFormat:
		case RedIntegerFormat:

			return 1;

		default:

			throw new Error( ERROR_FORMAT );

	}

}
