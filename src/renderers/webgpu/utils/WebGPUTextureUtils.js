import {
	GPUTextureFormat, GPUAddressMode, GPUFilterMode, GPUTextureDimension, GPUFeatureName
} from './WebGPUConstants.js';

import WebGPUTexturePassUtils from './WebGPUTexturePassUtils.js';

import {
	ByteType, ShortType,
	NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter,
	RepeatWrapping, MirroredRepeatWrapping,
	RGB_ETC2_Format, RGBA_ETC2_EAC_Format,
	RGBAFormat, RGBFormat, RedFormat, RGFormat, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, UnsignedByteType, FloatType, HalfFloatType, SRGBColorSpace, DepthFormat, DepthStencilFormat,
	RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format,
	RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, UnsignedIntType, UnsignedShortType, UnsignedInt248Type, UnsignedInt5999Type,
	NeverCompare, AlwaysCompare, LessCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare, IntType, RedIntegerFormat, RGIntegerFormat, RGBAIntegerFormat,
	CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping
} from '../../../constants.js';
import { CubeTexture } from '../../../textures/CubeTexture.js';
import { DepthTexture } from '../../../textures/DepthTexture.js';
import { Texture } from '../../../textures/Texture.js';

const _compareToWebGPU = {
	[ NeverCompare ]: 'never',
	[ LessCompare ]: 'less',
	[ EqualCompare ]: 'equal',
	[ LessEqualCompare ]: 'less-equal',
	[ GreaterCompare ]: 'greater',
	[ GreaterEqualCompare ]: 'greater-equal',
	[ AlwaysCompare ]: 'always',
	[ NotEqualCompare ]: 'not-equal'
};

const _flipMap = [ 0, 1, 3, 2, 4, 5 ];

class WebGPUTextureUtils {

	constructor( backend ) {

		this.backend = backend;

		this._passUtils = null;

		this.defaultTexture = {};
		this.defaultCubeTexture = {};
		this.defaultVideoFrame = null;

		this.colorBuffer = null;

		this.depthTexture = new DepthTexture();
		this.depthTexture.name = 'depthBuffer';

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

		const format = getFormat( texture );

		if ( texture.isCubeTexture ) {

			textureGPU = this._getDefaultCubeTextureGPU( format );

		} else if ( texture.isVideoTexture ) {

			this.backend.get( texture ).externalTexture = this._getDefaultVideoFrame();

		} else {

			textureGPU = this._getDefaultTextureGPU( format );

		}

		this.backend.get( texture ).texture = textureGPU;

	}

	createTexture( texture, options = {} ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		if ( textureData.initialized ) {

			throw new Error( 'WebGPUTextureUtils: Texture already initialized.' );

		}

		if ( options.needsMipmaps === undefined ) options.needsMipmaps = false;
		if ( options.levels === undefined ) options.levels = 1;
		if ( options.depth === undefined ) options.depth = 1;

		const { width, height, depth, levels } = options;

		const dimension = this._getDimension( texture );
		const format = texture.internalFormat || options.format || getFormat( texture, backend.device );

		let sampleCount = options.sampleCount !== undefined ? options.sampleCount : 1;

		sampleCount = backend.utils.getSampleCount( sampleCount );

		const primarySampleCount = texture.isRenderTargetTexture && ! texture.isMultisampleRenderTargetTexture ? 1 : sampleCount;

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

		if ( texture.isStorageTexture === true ) {

			usage |= GPUTextureUsage.STORAGE_BINDING;

		}

		if ( texture.isCompressedTexture !== true && texture.isCompressedArrayTexture !== true ) {

			usage |= GPUTextureUsage.RENDER_ATTACHMENT;

		}

		const textureDescriptorGPU = {
			label: texture.name,
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: depth,
			},
			mipLevelCount: levels,
			sampleCount: primarySampleCount,
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

			if ( format === undefined ) {

				console.warn( 'WebGPURenderer: Texture format not supported.' );

				return this.createDefaultTexture( texture );

			}

			textureData.texture = backend.device.createTexture( textureDescriptorGPU );

		}

		if ( texture.isRenderTargetTexture && sampleCount > 1 && ! texture.isMultisampleRenderTargetTexture ) {

			const msaaTextureDescriptorGPU = Object.assign( {}, textureDescriptorGPU );

			msaaTextureDescriptorGPU.label = msaaTextureDescriptorGPU.label + '-msaa';
			msaaTextureDescriptorGPU.sampleCount = sampleCount;

			textureData.msaaTexture = backend.device.createTexture( msaaTextureDescriptorGPU );

		}

		textureData.initialized = true;

		textureData.textureDescriptorGPU = textureDescriptorGPU;

	}

	destroyTexture( texture ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		textureData.texture.destroy();

		if ( textureData.msaaTexture !== undefined ) textureData.msaaTexture.destroy();

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

			const depth = texture.image.depth || 1;

			for ( let i = 0; i < depth; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i );

			}

		}

	}

	getColorBuffer() {

		if ( this.colorBuffer ) this.colorBuffer.destroy();

		const backend = this.backend;
		const { width, height } = backend.getDrawingBufferSize();

		this.colorBuffer = backend.device.createTexture( {
			label: 'colorBuffer',
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: 1
			},
			sampleCount: backend.utils.getSampleCount( backend.renderer.samples ),
			format: backend.utils.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

		return this.colorBuffer;

	}

	getDepthBuffer( depth = true, stencil = false ) {

		const backend = this.backend;
		const { width, height } = backend.getDrawingBufferSize();

		const depthTexture = this.depthTexture;
		const depthTextureGPU = backend.get( depthTexture ).texture;

		let format, type;

		if ( stencil ) {

			format = DepthStencilFormat;
			type = UnsignedInt248Type;

		} else if ( depth ) {

			format = DepthFormat;
			type = UnsignedIntType;

		}

		if ( depthTextureGPU !== undefined ) {

			if ( depthTexture.image.width === width && depthTexture.image.height === height && depthTexture.format === format && depthTexture.type === type ) {

				return depthTextureGPU;

			}

			this.destroyTexture( depthTexture );

		}

		depthTexture.name = 'depthBuffer';
		depthTexture.format = format;
		depthTexture.type = type;
		depthTexture.image.width = width;
		depthTexture.image.height = height;

		this.createTexture( depthTexture, { sampleCount: backend.utils.getSampleCount( backend.renderer.samples ), width, height } );

		return backend.get( depthTexture ).texture;

	}

	updateTexture( texture, options ) {

		const textureData = this.backend.get( texture );

		const { textureDescriptorGPU } = textureData;

		if ( texture.isRenderTargetTexture || ( textureDescriptorGPU === undefined /* unsupported texture format */ ) )
			return;

		// transfer texture data

		if ( texture.isDataTexture ) {

			this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

		} else if ( texture.isDataArrayTexture || texture.isData3DTexture ) {

			for ( let i = 0; i < options.image.depth; i ++ ) {

				this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, i, texture.flipY, i );

			}

		} else if ( texture.isCompressedTexture || texture.isCompressedArrayTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, textureData.texture, textureDescriptorGPU );

		} else if ( texture.isCubeTexture ) {

			this._copyCubeMapToTexture( options.images, textureData.texture, textureDescriptorGPU, texture.flipY );

		} else if ( texture.isVideoTexture ) {

			const video = texture.source.data;

			textureData.externalTexture = video;

		} else {

			this._copyImageToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

		}

		//

		textureData.version = texture.version;

		if ( texture.onUpdate ) texture.onUpdate( texture );

	}

	async copyTextureToBuffer( texture, x, y, width, height ) {

		const device = this.backend.device;

		const textureData = this.backend.get( texture );
		const textureGPU = textureData.texture;
		const format = textureData.textureDescriptorGPU.format;
		const bytesPerTexel = this._getBytesPerTexel( format );

		let bytesPerRow = width * bytesPerTexel;
		bytesPerRow = Math.ceil( bytesPerRow / 256 ) * 256; // Align to 256 bytes

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
				bytesPerRow: bytesPerRow
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

	_getDefaultTextureGPU( format ) {

		let defaultTexture = this.defaultTexture[ format ];

		if ( defaultTexture === undefined ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, format } );

			this.defaultTexture[ format ] = defaultTexture = texture;

		}

		return this.backend.get( defaultTexture ).texture;

	}

	_getDefaultCubeTextureGPU( format ) {

		let defaultCubeTexture = this.defaultTexture[ format ];

		if ( defaultCubeTexture === undefined ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, depth: 6 } );

			this.defaultCubeTexture[ format ] = defaultCubeTexture = texture;

		}

		return this.backend.get( defaultCubeTexture ).texture;

	}

	_getDefaultVideoFrame() {

		let defaultVideoFrame = this.defaultVideoFrame;

		if ( defaultVideoFrame === null ) {

			const init = {
				timestamp: 0,
				codedWidth: 1,
				codedHeight: 1,
				format: 'RGBA',
			};

			this.defaultVideoFrame = defaultVideoFrame = new VideoFrame( new Uint8Array( [ 0, 0, 0, 0xff ] ), init );

		}

		return defaultVideoFrame;

	}

	_copyCubeMapToTexture( images, textureGPU, textureDescriptorGPU, flipY ) {

		for ( let i = 0; i < 6; i ++ ) {

			const image = images[ i ];

			const flipIndex = flipY === true ? _flipMap[ i ] : i;

			if ( image.isDataTexture ) {

				this._copyBufferToTexture( image.image, textureGPU, textureDescriptorGPU, flipIndex, flipY );

			} else {

				this._copyImageToTexture( image, textureGPU, textureDescriptorGPU, flipIndex, flipY );

			}

		}

	}

	_copyImageToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY ) {

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

		if ( flipY === true ) {

			this._flipY( textureGPU, textureDescriptorGPU, originDepth );

		}

	}

	_getPassUtils() {

		let passUtils = this._passUtils;

		if ( passUtils === null ) {

			this._passUtils = passUtils = new WebGPUTexturePassUtils( this.backend.device );

		}

		return passUtils;

	}

	_generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer = 0 ) {

		this._getPassUtils().generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer );

	}

	_flipY( textureGPU, textureDescriptorGPU, originDepth = 0 ) {

		this._getPassUtils().flipY( textureGPU, textureDescriptorGPU, originDepth );

	}

	_copyBufferToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY, depth = 0 ) {

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
				offset: image.width * image.height * bytesPerTexel * depth,
				bytesPerRow
			},
			{
				width: image.width,
				height: image.height,
				depthOrArrayLayers: 1
			} );

		if ( flipY === true ) {

			this._flipY( textureGPU, textureDescriptorGPU, originDepth );

		}

	}

	_copyCompressedBufferToTexture( mipmaps, textureGPU, textureDescriptorGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const device = this.backend.device;

		const blockData = this._getBlockData( textureDescriptorGPU.format );
		const isTextureArray = textureDescriptorGPU.size.depthOrArrayLayers > 1;

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;
			const depth = isTextureArray ? textureDescriptorGPU.size.depthOrArrayLayers : 1;

			const bytesPerRow = Math.ceil( width / blockData.width ) * blockData.byteLength;
			const bytesPerImage = bytesPerRow * Math.ceil( height / blockData.height );

			for ( let j = 0; j < depth; j ++ ) {

				device.queue.writeTexture(
					{
						texture: textureGPU,
						mipLevel: i,
						origin: { x: 0, y: 0, z: j }
					},
					mipmap.data,
					{
						offset: j * bytesPerImage,
						bytesPerRow,
						rowsPerImage: Math.ceil( height / blockData.height )
					},
					{
						width: Math.ceil( width / blockData.width ) * blockData.width,
						height: Math.ceil( height / blockData.height ) * blockData.height,
						depthOrArrayLayers: 1
					}
				);

			}

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

	_getBytesPerTexel( format ) {

		// 8-bit formats
		if ( format === GPUTextureFormat.R8Unorm ||
			format === GPUTextureFormat.R8Snorm ||
			format === GPUTextureFormat.R8Uint ||
			format === GPUTextureFormat.R8Sint ) return 1;

		// 16-bit formats
		if ( format === GPUTextureFormat.R16Uint ||
			format === GPUTextureFormat.R16Sint ||
			format === GPUTextureFormat.R16Float ||
			format === GPUTextureFormat.RG8Unorm ||
			format === GPUTextureFormat.RG8Snorm ||
			format === GPUTextureFormat.RG8Uint ||
			format === GPUTextureFormat.RG8Sint ) return 2;

		// 32-bit formats
		if ( format === GPUTextureFormat.R32Uint ||
			format === GPUTextureFormat.R32Sint ||
			format === GPUTextureFormat.R32Float ||
			format === GPUTextureFormat.RG16Uint ||
			format === GPUTextureFormat.RG16Sint ||
			format === GPUTextureFormat.RG16Float ||
			format === GPUTextureFormat.RGBA8Unorm ||
			format === GPUTextureFormat.RGBA8UnormSRGB ||
			format === GPUTextureFormat.RGBA8Snorm ||
			format === GPUTextureFormat.RGBA8Uint ||
			format === GPUTextureFormat.RGBA8Sint ||
			format === GPUTextureFormat.BGRA8Unorm ||
			format === GPUTextureFormat.BGRA8UnormSRGB ||
			// Packed 32-bit formats
			format === GPUTextureFormat.RGB9E5UFloat ||
			format === GPUTextureFormat.RGB10A2Unorm ||
			format === GPUTextureFormat.RG11B10UFloat ||
			format === GPUTextureFormat.Depth32Float ||
			format === GPUTextureFormat.Depth24Plus ||
			format === GPUTextureFormat.Depth24PlusStencil8 ||
			format === GPUTextureFormat.Depth32FloatStencil8 ) return 4;

		// 64-bit formats
		if ( format === GPUTextureFormat.RG32Uint ||
			format === GPUTextureFormat.RG32Sint ||
			format === GPUTextureFormat.RG32Float ||
			format === GPUTextureFormat.RGBA16Uint ||
			format === GPUTextureFormat.RGBA16Sint ||
			format === GPUTextureFormat.RGBA16Float ) return 8;

		// 128-bit formats
		if ( format === GPUTextureFormat.RGBA32Uint ||
			format === GPUTextureFormat.RGBA32Sint ||
			format === GPUTextureFormat.RGBA32Float ) return 16;


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
		if ( format === GPUTextureFormat.R16Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG16Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA16Float ) return Float32Array;


		if ( format === GPUTextureFormat.R32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.R32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.R32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RG32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RG32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RGBA32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RGBA32Float ) return Float32Array;

		if ( format === GPUTextureFormat.BGRA8Unorm ) return Uint8Array;
		if ( format === GPUTextureFormat.BGRA8UnormSRGB ) return Uint8Array;
		if ( format === GPUTextureFormat.RGB10A2Unorm ) return Uint32Array;
		if ( format === GPUTextureFormat.RGB9E5UFloat ) return Uint32Array;
		if ( format === GPUTextureFormat.RG11B10UFloat ) return Uint32Array;

		if ( format === GPUTextureFormat.Depth32Float ) return Float32Array;
		if ( format === GPUTextureFormat.Depth24Plus ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth24PlusStencil8 ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth32FloatStencil8 ) return Float32Array;

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

}

export function getFormat( texture, device = null ) {

	const format = texture.format;
	const type = texture.type;
	const colorSpace = texture.colorSpace;

	let formatGPU;

	if ( texture.isFramebufferTexture === true && texture.type === UnsignedByteType ) {

		formatGPU = GPUTextureFormat.BGRA8Unorm;

	} else if ( texture.isCompressedTexture === true || texture.isCompressedArrayTexture === true ) {

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

					case ByteType:
						formatGPU = GPUTextureFormat.RGBA8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.RGBA16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.RGBA16Uint;
						break;
					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RGBA32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.RGBA32Sint;
						break;

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

			case RGBFormat:

				switch ( type ) {

					case UnsignedInt5999Type:
						formatGPU = GPUTextureFormat.RGB9E5UFloat;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGBFormat.', type );

				}

				break;

			case RedFormat:

				switch ( type ) {

					case ByteType:
						formatGPU = GPUTextureFormat.R8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.R16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.R16Uint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.R32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.R32Sint;
						break;

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

					case ByteType:
						formatGPU = GPUTextureFormat.RG8Snorm;
						break;

					case ShortType:
						formatGPU = GPUTextureFormat.RG16Sint;
						break;

					case UnsignedShortType:
						formatGPU = GPUTextureFormat.RG16Uint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RG32Uint;
						break;

					case IntType:
						formatGPU = GPUTextureFormat.RG32Sint;
						break;

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

						if ( device && device.features.has( GPUFeatureName.Depth32FloatStencil8 ) === false ) {

							console.error( 'WebGPURenderer: Depth textures with DepthStencilFormat + FloatType can only be used with the "depth32float-stencil8" GPU feature.' );

						}

						formatGPU = GPUTextureFormat.Depth32FloatStencil8;

						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with DepthStencilFormat.', type );

				}

				break;

			case RedIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.R32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.R32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RedIntegerFormat.', type );

				}

				break;

			case RGIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.RG32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RG32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGIntegerFormat.', type );

				}

				break;

			case RGBAIntegerFormat:

				switch ( type ) {

					case IntType:
						formatGPU = GPUTextureFormat.RGBA32Sint;
						break;

					case UnsignedIntType:
						formatGPU = GPUTextureFormat.RGBA32Uint;
						break;

					default:
						console.error( 'WebGPURenderer: Unsupported texture type with RGBAIntegerFormat.', type );

				}

				break;

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	}

	return formatGPU;

}

export default WebGPUTextureUtils;
