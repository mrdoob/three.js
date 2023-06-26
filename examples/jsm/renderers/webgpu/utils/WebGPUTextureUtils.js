import {
	GPUTextureFormat, GPUAddressMode, GPUFilterMode, GPUTextureDimension, GPUFeatureName
} from './WebGPUConstants.js';

import {
	CubeTexture, Texture,
	NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter,
	RepeatWrapping, MirroredRepeatWrapping,
	RGB_ETC2_Format, RGBA_ETC2_EAC_Format,
	RGBAFormat, RedFormat, RGFormat, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, UnsignedByteType, FloatType, HalfFloatType, SRGBColorSpace, DepthFormat, DepthStencilFormat,
	RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format,
	RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, UnsignedIntType, UnsignedShortType, UnsignedInt248Type,
	NeverCompare, AlwaysCompare, LessCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare
} from 'three';

import { CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping } from 'three';

import WebGPUTextureMipmapUtils from './WebGPUTextureMipmapUtils.js';

const _compareToWebGPU = {
	[ NeverCompare ]: 'never',
	[ AlwaysCompare ]: 'less',
	[ LessCompare ]: 'equal',
	[ LessEqualCompare ]: 'less-equal',
	[ EqualCompare ]: 'greater',
	[ GreaterEqualCompare ]: 'not-equal',
	[ GreaterCompare ]: 'greater-equal',
	[ NotEqualCompare ]: 'always'
};

class WebGPUTextureUtils {

	constructor( backend ) {

		this.backend = backend;

		this.mipmapUtils = null;

		this.defaultTexture = null;
		this.defaultCubeTexture = null;

	}

	createSampler( texture ) {

		const backend = this.backend;
		const device = backend.device;

		const textureGPU = backend.get( texture );

		const samplerDescriptorGPU = {
			addressModeU: this._convertAddressMode( texture.wrapS ),
			addressModeV: this._convertAddressMode( texture.wrapT ),
			addressModeW: this._convertAddressMode( texture.wrapR ),
			magFilter: this._convertFilterMode( texture.magFilter ),
			minFilter: this._convertFilterMode( texture.minFilter ),
			mipmapFilter: this._convertFilterMode( texture.minFilter ),
			maxAnisotropy: texture.anisotropy
		};

		if ( texture.isDepthTexture && texture.compareFunction !== null ) {

			samplerDescriptorGPU.compare = _compareToWebGPU[ texture.compareFunction ];

		}

		textureGPU.sampler = device.createSampler( samplerDescriptorGPU );

	}

	createDefaultTexture( texture ) {

		let textureGPU;

		if ( texture.isCubeTexture ) {

			textureGPU = this._getDefaultCubeTextureGPU();

		} else {

			textureGPU = this._getDefaultTextureGPU();

		}

		this.backend.get( texture ).texture = textureGPU;

	}

	createTexture( texture, options = {} ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		if ( textureData.initialized ) {

			throw new Error( 'WebGPUTextureUtils: Texture already initialized.' );

		}

		const { width, height, depth } = this._getSize( texture );

		const needsMipmaps = this._needsMipmaps( texture );
		const dimension = this._getDimension( texture );
		const mipLevelCount = this._getMipLevelCount( texture, width, height, needsMipmaps );
		const format = texture.internalFormat || this._getFormat( texture );
		//const sampleCount = texture.isRenderTargetTexture || texture.isDepthTexture ? backend.utils.getSampleCount( renderContext ) : 1;
		const sampleCount = options.sampleCount !== undefined ? options.sampleCount : 1;

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

		if ( texture.isCompressedTexture !== true ) {

			usage |= GPUTextureUsage.RENDER_ATTACHMENT;

		}

		const textureDescriptorGPU = {
			label: texture.name,
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: depth,
			},
			mipLevelCount: mipLevelCount,
			sampleCount: sampleCount,
			dimension: dimension,
			format: format,
			usage: usage
		};

		// texture creation

		if ( texture.isVideoTexture ) {

			const video = texture.source.data;
			const videoFrame = new VideoFrame( video );

			textureDescriptorGPU.size.width = videoFrame.displayWidth;
			textureDescriptorGPU.size.height = videoFrame.displayHeight;

			videoFrame.close();

			textureData.externalTexture = video;

		} else {

			textureData.texture = backend.device.createTexture( textureDescriptorGPU );

		}

		textureData.initialized = true;

		textureData.needsMipmaps = needsMipmaps;
		textureData.textureDescriptorGPU = textureDescriptorGPU;

	}

	destroyTexture( texture ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		textureData.texture.destroy();

		backend.delete( texture );

	}

	destroySampler( texture ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		delete textureData.sampler;

	}

	generateMipmaps( texture ) {

		const textureData = this.backend.get( texture );

		if ( texture.isCubeTexture ) {

			for ( let i = 0; i < 6; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i );

			}

		} else {

			this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU );

		}

	}

	updateTexture( texture ) {

		const textureData = this.backend.get( texture );

		const { needsMipmaps, textureDescriptorGPU } = textureData;

		// transfer texture data

		if ( texture.isDataTexture || texture.isDataArrayTexture || texture.isData3DTexture ) {

			this._copyBufferToTexture( texture.image, textureData.texture, textureDescriptorGPU, needsMipmaps );

		} else if ( texture.isCompressedTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, textureData.texture, textureDescriptorGPU );

		} else if ( texture.isCubeTexture ) {

			if ( texture.image.length === 6 ) {

				this._copyCubeMapToTexture( texture.image, texture, textureData.texture, textureDescriptorGPU, needsMipmaps );

			}

		} else if ( texture.isRenderTargetTexture ) {

			if ( needsMipmaps === true ) this._generateMipmaps( textureData.texture, textureDescriptorGPU );

		} else if ( texture.isVideoTexture ) {

			const video = texture.source.data;

			textureData.externalTexture = video;

		} else if ( texture.image !== null ) {

			this._copyImageToTexture( texture.image, texture, textureData.texture, textureDescriptorGPU, needsMipmaps );

		} else {

			console.warn( 'WebGPUTextureUtils: Unable to update texture.' );

		}

		//

		textureData.version = texture.version;

	}

	async copyTextureToBuffer( texture, x, y, width, height ) {

		const device = this.backend.device;

		const textureData = this.backend.get( texture );
		const textureGPU = textureData.texture;
		const format = textureData.textureDescriptorGPU.format;
		const bytesPerTexel = this._getBytesPerTexel( format );

		const readBuffer = device.createBuffer(
			{
				size: width * height * bytesPerTexel,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			}
		);

		const encoder = device.createCommandEncoder();

		encoder.copyTextureToBuffer(
			{
				texture: textureGPU,
				origin: { x, y },
			},
			{
				buffer: readBuffer,
				bytesPerRow: width * bytesPerTexel
			},
			{
				width: width,
				height: height
			}

		);

		const typedArrayType = this._getTypedArrayType( format );

		device.queue.submit( [ encoder.finish() ] );

		await readBuffer.mapAsync( GPUMapMode.READ );

		const buffer = readBuffer.getMappedRange();

		return new typedArrayType( buffer );

	}

	_isEnvironmentTexture( texture ) {

		const mapping = texture.mapping;

		return ( mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping ) || ( mapping === CubeReflectionMapping || mapping === CubeRefractionMapping );

	}

	_getDefaultTextureGPU() {

		let defaultTexture = this.defaultTexture;

		if ( defaultTexture === null ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture );

			this.defaultTexture = defaultTexture = texture;

		}

		return this.backend.get( defaultTexture ).texture;

	}

	_getDefaultCubeTextureGPU() {

		let defaultCubeTexture = this.defaultTexture;

		if ( defaultCubeTexture === null ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture );

			this.defaultCubeTexture = defaultCubeTexture = texture;

		}

		return this.backend.get( defaultCubeTexture ).texture;

	}

	_copyImageToTexture( image, texture, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth ) {

		if ( this._isHTMLImage( image ) ) {

			this._getImageBitmapFromHTML( image, texture ).then( imageBitmap => {

				this._copyExternalImageToTexture( imageBitmap, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth );

			} );

		} else {

			// assume ImageBitmap

			this._copyExternalImageToTexture( image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth );

		}

	}

	_isHTMLImage( image ) {

		return ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) || ( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement );

	}

	_copyCubeMapToTexture( images, texture, textureGPU, textureDescriptorGPU, needsMipmaps ) {

		for ( let i = 0; i < 6; i ++ ) {

			const image = images[ i ];

			if ( image.isDataTexture ) {

				this._copyBufferToTexture( image.image, textureGPU, textureDescriptorGPU, needsMipmaps, i );

			} else {

				this._copyImageToTexture( image, texture, textureGPU, textureDescriptorGPU, needsMipmaps, i );

			}

		}

	}

	_copyExternalImageToTexture( image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth = 0 ) {

		const device = this.backend.device;

		device.queue.copyExternalImageToTexture(
			{
				source: image
			}, {
				texture: textureGPU,
				mipLevel: 0,
				origin: { x: 0, y: 0, z: originDepth }
			}, {
				width: image.width,
				height: image.height,
				depthOrArrayLayers: 1
			}
		);

		if ( needsMipmaps ) this._generateMipmaps( textureGPU, textureDescriptorGPU, originDepth );

	}

	_generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer = 0 ) {

		if ( this.mipmapUtils === null ) {

			this.mipmapUtils = new WebGPUTextureMipmapUtils( this.backend.device );

		}

		this.mipmapUtils.generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer );

	}

	_getImageBitmapFromHTML( image, texture ) {

		const width = image.width;
		const height = image.height;

		const options = {};

		options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';
		options.premultiplyAlpha = ( texture.premultiplyAlpha === true ) ? 'premultiply' : 'default';

		return createImageBitmap( image, 0, 0, width, height, options );

	}

	_copyBufferToTexture( image, textureGPU, textureDescriptorGPU, needsMipmaps, originDepth = 0 ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
		// @TODO: Consider to support valid buffer layouts with other formats like RGB

		const device = this.backend.device;

		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( textureDescriptorGPU.format );
		const bytesPerRow = image.width * bytesPerTexel;

		device.queue.writeTexture(
			{
				texture: textureGPU,
				mipLevel: 0,
				origin: { x: 0, y: 0, z: originDepth }
			},
			data,
			{
				offset: 0,
				bytesPerRow
			},
			{
				width: image.width,
				height: image.height,
				depthOrArrayLayers: ( image.depth !== undefined ) ? image.depth : 1
			} );

		if ( needsMipmaps === true ) this._generateMipmaps( textureGPU, textureDescriptorGPU, originDepth );

	}

	_copyCompressedBufferToTexture( mipmaps, textureGPU, textureDescriptorGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const device = this.backend.device;

		const blockData = this._getBlockData( textureDescriptorGPU.format );

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;

			const bytesPerRow = Math.ceil( width / blockData.width ) * blockData.byteLength;

			device.queue.writeTexture(
				{
					texture: textureGPU,
					mipLevel: i
				},
				mipmap.data,
				{
					offset: 0,
					bytesPerRow
				},
				{
					width: Math.ceil( width / blockData.width ) * blockData.width,
					height: Math.ceil( height / blockData.width ) * blockData.width,
					depthOrArrayLayers: 1
				}
			);

		}

	}

	_getBlockData( format ) {

		// this method is only relevant for compressed texture formats

		if ( format === GPUTextureFormat.BC1RGBAUnorm || format === GPUTextureFormat.BC1RGBAUnormSRGB ) return { byteLength: 8, width: 4, height: 4 }; // DXT1
		if ( format === GPUTextureFormat.BC2RGBAUnorm || format === GPUTextureFormat.BC2RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT3
		if ( format === GPUTextureFormat.BC3RGBAUnorm || format === GPUTextureFormat.BC3RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT5
		if ( format === GPUTextureFormat.BC4RUnorm || format === GPUTextureFormat.BC4RSNorm ) return { byteLength: 8, width: 4, height: 4 }; // RGTC1
		if ( format === GPUTextureFormat.BC5RGUnorm || format === GPUTextureFormat.BC5RGSnorm ) return { byteLength: 16, width: 4, height: 4 }; // RGTC2
		if ( format === GPUTextureFormat.BC6HRGBUFloat || format === GPUTextureFormat.BC6HRGBFloat ) return { byteLength: 16, width: 4, height: 4 }; // BPTC (float)
		if ( format === GPUTextureFormat.BC7RGBAUnorm || format === GPUTextureFormat.BC7RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // BPTC (unorm)

		if ( format === GPUTextureFormat.ETC2RGB8Unorm || format === GPUTextureFormat.ETC2RGB8UnormSRGB ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ETC2RGB8A1Unorm || format === GPUTextureFormat.ETC2RGB8A1UnormSRGB ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ETC2RGBA8Unorm || format === GPUTextureFormat.ETC2RGBA8UnormSRGB ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACR11Unorm ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACR11Snorm ) return { byteLength: 8, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACRG11Unorm ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.EACRG11Snorm ) return { byteLength: 16, width: 4, height: 4 };

		if ( format === GPUTextureFormat.ASTC4x4Unorm || format === GPUTextureFormat.ASTC4x4UnormSRGB ) return { byteLength: 16, width: 4, height: 4 };
		if ( format === GPUTextureFormat.ASTC5x4Unorm || format === GPUTextureFormat.ASTC5x4UnormSRGB ) return { byteLength: 16, width: 5, height: 4 };
		if ( format === GPUTextureFormat.ASTC5x5Unorm || format === GPUTextureFormat.ASTC5x5UnormSRGB ) return { byteLength: 16, width: 5, height: 5 };
		if ( format === GPUTextureFormat.ASTC6x5Unorm || format === GPUTextureFormat.ASTC6x5UnormSRGB ) return { byteLength: 16, width: 6, height: 5 };
		if ( format === GPUTextureFormat.ASTC6x6Unorm || format === GPUTextureFormat.ASTC6x6UnormSRGB ) return { byteLength: 16, width: 6, height: 6 };
		if ( format === GPUTextureFormat.ASTC8x5Unorm || format === GPUTextureFormat.ASTC8x5UnormSRGB ) return { byteLength: 16, width: 8, height: 5 };
		if ( format === GPUTextureFormat.ASTC8x6Unorm || format === GPUTextureFormat.ASTC8x6UnormSRGB ) return { byteLength: 16, width: 8, height: 6 };
		if ( format === GPUTextureFormat.ASTC8x8Unorm || format === GPUTextureFormat.ASTC8x8UnormSRGB ) return { byteLength: 16, width: 8, height: 8 };
		if ( format === GPUTextureFormat.ASTC10x5Unorm || format === GPUTextureFormat.ASTC10x5UnormSRGB ) return { byteLength: 16, width: 10, height: 5 };
		if ( format === GPUTextureFormat.ASTC10x6Unorm || format === GPUTextureFormat.ASTC10x6UnormSRGB ) return { byteLength: 16, width: 10, height: 6 };
		if ( format === GPUTextureFormat.ASTC10x8Unorm || format === GPUTextureFormat.ASTC10x8UnormSRGB ) return { byteLength: 16, width: 10, height: 8 };
		if ( format === GPUTextureFormat.ASTC10x10Unorm || format === GPUTextureFormat.ASTC10x10UnormSRGB ) return { byteLength: 16, width: 10, height: 10 };
		if ( format === GPUTextureFormat.ASTC12x10Unorm || format === GPUTextureFormat.ASTC12x10UnormSRGB ) return { byteLength: 16, width: 12, height: 10 };
		if ( format === GPUTextureFormat.ASTC12x12Unorm || format === GPUTextureFormat.ASTC12x12UnormSRGB ) return { byteLength: 16, width: 12, height: 12 };

	}

	_convertAddressMode( value ) {

		let addressMode = GPUAddressMode.ClampToEdge;

		if ( value === RepeatWrapping ) {

			addressMode = GPUAddressMode.Repeat;

		} else if ( value === MirroredRepeatWrapping ) {

			addressMode = GPUAddressMode.MirrorRepeat;

		}

		return addressMode;

	}

	_convertFilterMode( value ) {

		let filterMode = GPUFilterMode.Linear;

		if ( value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter ) {

			filterMode = GPUFilterMode.Nearest;

		}

		return filterMode;

	}

	_getSize( texture ) {

		const image = texture.image;

		let width, height, depth;

		if ( texture.isCubeTexture ) {

			const faceImage = image.length > 0 ? image[ 0 ].image || image[ 0 ] : null;

			width = faceImage ? faceImage.width : 1;
			height = faceImage ? faceImage.height : 1;
			depth = 6; // one image for each side of the cube map

		} else if ( image !== null ) {

			width = image.width;
			height = image.height;
			depth = ( image.depth !== undefined ) ? image.depth : 1;

		} else {

			width = height = depth = 1;

		}

		return { width, height, depth };

	}

	_needsMipmaps( texture ) {

		if ( this._isEnvironmentTexture( texture ) ) return true;

		return ( texture.isCompressedTexture !== true ) /*&& ( texture.generateMipmaps === true )*/ && ( texture.minFilter !== NearestFilter ) && ( texture.minFilter !== LinearFilter );

	}

	_getBytesPerTexel( format ) {

		if ( format === GPUTextureFormat.R8Unorm ) return 1;
		if ( format === GPUTextureFormat.R16Float ) return 2;
		if ( format === GPUTextureFormat.RG8Unorm ) return 2;
		if ( format === GPUTextureFormat.RG16Float ) return 4;
		if ( format === GPUTextureFormat.R32Float ) return 4;
		if ( format === GPUTextureFormat.RGBA8Unorm || format === GPUTextureFormat.RGBA8UnormSRGB ) return 4;
		if ( format === GPUTextureFormat.RG32Float ) return 8;
		if ( format === GPUTextureFormat.RGBA16Float ) return 8;
		if ( format === GPUTextureFormat.RGBA32Float ) return 16;

	}

	_getTypedArrayType( format ) {

		if ( format === GPUTextureFormat.R8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.R8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.R8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.R8Snorm ) return Int8Array;
		if ( format === GPUTextureFormat.RG8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.RG8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.RG8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.RG8Snorm ) return Int8Array;
		if ( format === GPUTextureFormat.RGBA8Uint ) return Uint8Array;
		if ( format === GPUTextureFormat.RGBA8Sint ) return Int8Array;
		if ( format === GPUTextureFormat.RGBA8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.RGBA8Snorm ) return Int8Array;


		if ( format === GPUTextureFormat.R16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.R16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RG16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RG16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RGBA16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RGBA16Sint ) return Int16Array;


		if ( format === GPUTextureFormat.R32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.R32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.R32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RG32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RG32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RGBA32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RGBA32Float ) return Float32Array;

	}

	_getDimension( texture ) {

		let dimension;

		if ( texture.isData3DTexture ) {

			dimension = GPUTextureDimension.ThreeD;

		} else {

			dimension = GPUTextureDimension.TwoD;

		}

		return dimension;

	}

	_getMipLevelCount( texture, width, height, needsMipmaps ) {

		let mipLevelCount;

		if ( texture.isCompressedTexture ) {

			mipLevelCount = texture.mipmaps.length;

		} else if ( needsMipmaps ) {

			mipLevelCount = Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

		} else {

			mipLevelCount = 1; // a texture without mipmaps has a base mip (mipLevel 0)

		}

		return mipLevelCount;

	}

	_getFormat( texture ) {

		const format = texture.format;
		const type = texture.type;
		const colorSpace = texture.colorSpace;

		let formatGPU;

		if ( /*texture.isRenderTargetTexture === true ||*/ texture.isFramebufferTexture === true ) {

			formatGPU = GPUTextureFormat.BGRA8Unorm;

		} else if ( texture.isCompressedTexture === true ) {

			switch ( format ) {

				case RGBA_S3TC_DXT1_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
					break;

				case RGBA_S3TC_DXT3_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
					break;

				case RGBA_S3TC_DXT5_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
					break;

				case RGB_ETC2_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ETC2RGB8UnormSRGB : GPUTextureFormat.ETC2RGB8Unorm;
					break;

				case RGBA_ETC2_EAC_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ETC2RGBA8UnormSRGB : GPUTextureFormat.ETC2RGBA8Unorm;
					break;

				case RGBA_ASTC_4x4_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC4x4UnormSRGB : GPUTextureFormat.ASTC4x4Unorm;
					break;

				case RGBA_ASTC_5x4_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC5x4UnormSRGB : GPUTextureFormat.ASTC5x4Unorm;
					break;

				case RGBA_ASTC_5x5_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC5x5UnormSRGB : GPUTextureFormat.ASTC5x5Unorm;
					break;

				case RGBA_ASTC_6x5_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC6x5UnormSRGB : GPUTextureFormat.ASTC6x5Unorm;
					break;

				case RGBA_ASTC_6x6_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC6x6UnormSRGB : GPUTextureFormat.ASTC6x6Unorm;
					break;

				case RGBA_ASTC_8x5_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x5UnormSRGB : GPUTextureFormat.ASTC8x5Unorm;
					break;

				case RGBA_ASTC_8x6_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x6UnormSRGB : GPUTextureFormat.ASTC8x6Unorm;
					break;

				case RGBA_ASTC_8x8_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC8x8UnormSRGB : GPUTextureFormat.ASTC8x8Unorm;
					break;

				case RGBA_ASTC_10x5_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x5UnormSRGB : GPUTextureFormat.ASTC10x5Unorm;
					break;

				case RGBA_ASTC_10x6_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x6UnormSRGB : GPUTextureFormat.ASTC10x6Unorm;
					break;

				case RGBA_ASTC_10x8_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x8UnormSRGB : GPUTextureFormat.ASTC10x8Unorm;
					break;

				case RGBA_ASTC_10x10_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC10x10UnormSRGB : GPUTextureFormat.ASTC10x10Unorm;
					break;

				case RGBA_ASTC_12x10_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC12x10UnormSRGB : GPUTextureFormat.ASTC12x10Unorm;
					break;

				case RGBA_ASTC_12x12_Format:
					formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.ASTC12x12UnormSRGB : GPUTextureFormat.ASTC12x12Unorm;
					break;

				default:
					console.error( 'WebGPURenderer: Unsupported texture format.', format );

			}

		} else {

			switch ( format ) {

				case RGBAFormat:

					switch ( type ) {

						case UnsignedByteType:
							formatGPU = ( colorSpace === SRGBColorSpace ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
							break;

						case HalfFloatType:
							formatGPU = GPUTextureFormat.RGBA16Float;
							break;

						case FloatType:
							formatGPU = GPUTextureFormat.RGBA32Float;
							break;

						default:
							console.error( 'WebGPURenderer: Unsupported texture type with RGBAFormat.', type );

					}

					break;

				case RedFormat:

					switch ( type ) {

						case UnsignedByteType:
							formatGPU = GPUTextureFormat.R8Unorm;
							break;

						case HalfFloatType:
							formatGPU = GPUTextureFormat.R16Float;
							break;

						case FloatType:
							formatGPU = GPUTextureFormat.R32Float;
							break;

						default:
							console.error( 'WebGPURenderer: Unsupported texture type with RedFormat.', type );

					}

					break;

				case RGFormat:

					switch ( type ) {

						case UnsignedByteType:
							formatGPU = GPUTextureFormat.RG8Unorm;
							break;

						case HalfFloatType:
							formatGPU = GPUTextureFormat.RG16Float;
							break;

						case FloatType:
							formatGPU = GPUTextureFormat.RG32Float;
							break;

						default:
							console.error( 'WebGPURenderer: Unsupported texture type with RGFormat.', type );

					}

					break;

				case DepthFormat:

					switch ( type ) {

						case UnsignedShortType:
							formatGPU = GPUTextureFormat.Depth16Unorm;
							break;

						case UnsignedIntType:
							formatGPU = GPUTextureFormat.Depth24Plus;
							break;

						case FloatType:
							formatGPU = GPUTextureFormat.Depth32Float;
							break;

						default:
							console.error( 'WebGPURenderer: Unsupported texture type with DepthFormat.', type );

					}

					break;

				case DepthStencilFormat:

					switch ( type ) {

						case UnsignedInt248Type:
							formatGPU = GPUTextureFormat.Depth24PlusStencil8;
							break;

						case FloatType:

							if ( this.device.features.has( GPUFeatureName.Depth32FloatStencil8 ) === false ) {

								console.error( 'WebGPURenderer: Depth textures with DepthStencilFormat + FloatType can only be used with the "depth32float-stencil8" GPU feature.' );

							}

							formatGPU = GPUTextureFormat.Depth32FloatStencil8;

							break;

						default:
							console.error( 'WebGPURenderer: Unsupported texture type with DepthStencilFormat.', type );

					}

					break;

				default:
					console.error( 'WebGPURenderer: Unsupported texture format.', format );

			}

		}

		return formatGPU;

	}

}

export default WebGPUTextureUtils;
