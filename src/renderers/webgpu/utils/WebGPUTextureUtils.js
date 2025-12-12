import {
	GPUTextureFormat, GPUAddressMode, GPUFilterMode, GPUTextureDimension, GPUFeatureName, GPUTextureViewDimension
} from './WebGPUConstants.js';
import { ColorManagement } from '../../../math/ColorManagement.js';

import WebGPUTexturePassUtils from './WebGPUTexturePassUtils.js';

import {
	ByteType, ShortType,
	NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter,
	RepeatWrapping, MirroredRepeatWrapping,
	RGB_ETC2_Format, RGBA_ETC2_EAC_Format,
	RGBAFormat, RGBFormat, RedFormat, RGFormat, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, UnsignedByteType, FloatType, HalfFloatType, SRGBTransfer, DepthFormat, DepthStencilFormat,
	RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format,
	RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, UnsignedIntType, UnsignedShortType, UnsignedInt248Type, UnsignedInt5999Type,
	NeverCompare, AlwaysCompare, LessCompare, LessEqualCompare, EqualCompare, GreaterEqualCompare, GreaterCompare, NotEqualCompare, IntType, RedIntegerFormat, RGIntegerFormat, RGBAIntegerFormat,
	UnsignedInt101111Type, RGBA_BPTC_Format, RGB_ETC1_Format, RGB_S3TC_DXT1_Format, RED_RGTC1_Format, SIGNED_RED_RGTC1_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_GREEN_RGTC2_Format,
	R11_EAC_Format, SIGNED_R11_EAC_Format, RG11_EAC_Format, SIGNED_RG11_EAC_Format,
} from '../../../constants.js';
import { CubeTexture } from '../../../textures/CubeTexture.js';
import { Texture } from '../../../textures/Texture.js';
import { warn, error } from '../../../utils.js';

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

/**
 * A WebGPU backend utility module for managing textures.
 *
 * @private
 */
class WebGPUTextureUtils {

	/**
	 * Constructs a new utility object.
	 *
	 * @param {WebGPUBackend} backend - The WebGPU backend.
	 */
	constructor( backend ) {

		/**
		 * A reference to the WebGPU backend.
		 *
		 * @type {WebGPUBackend}
		 */
		this.backend = backend;

		/**
		 * A reference to the pass utils.
		 *
		 * @type {?WebGPUTexturePassUtils}
		 * @default null
		 */
		this._passUtils = null;

		/**
		 * A dictionary for managing default textures. The key
		 * is the texture format, the value the texture object.
		 *
		 * @type {Object<string,Texture>}
		 */
		this.defaultTexture = {};

		/**
		 * A dictionary for managing default cube textures. The key
		 * is the texture format, the value the texture object.
		 *
		 * @type {Object<string,CubeTexture>}
		 */
		this.defaultCubeTexture = {};

		/**
		 * A default video frame.
		 *
		 * @type {?VideoFrame}
		 * @default null
		 */
		this.defaultVideoFrame = null;

		/**
		 * A cache of shared texture samplers.
		 *
		 * @type {Map<string, Object>}
		 */
		this._samplerCache = new Map();

	}

	/**
	 * Creates a GPU sampler for the given texture.
	 *
	 * @param {Texture} texture - The texture to create the sampler for.
	 * @return {string} The current sampler key.
	 */
	updateSampler( texture ) {

		const backend = this.backend;

		const samplerKey = texture.minFilter + '-' + texture.magFilter + '-' +
			texture.wrapS + '-' + texture.wrapT + '-' + ( texture.wrapR || '0' ) + '-' +
			texture.anisotropy + '-' + ( texture.compareFunction || 0 );

		let samplerData = this._samplerCache.get( samplerKey );

		if ( samplerData === undefined ) {

			const samplerDescriptorGPU = {
				addressModeU: this._convertAddressMode( texture.wrapS ),
				addressModeV: this._convertAddressMode( texture.wrapT ),
				addressModeW: this._convertAddressMode( texture.wrapR ),
				magFilter: this._convertFilterMode( texture.magFilter ),
				minFilter: this._convertFilterMode( texture.minFilter ),
				mipmapFilter: this._convertFilterMode( texture.minFilter ),
				maxAnisotropy: 1
			};

			// anisotropy can only be used when all filter modes are set to linear.

			if ( samplerDescriptorGPU.magFilter === GPUFilterMode.Linear && samplerDescriptorGPU.minFilter === GPUFilterMode.Linear && samplerDescriptorGPU.mipmapFilter === GPUFilterMode.Linear ) {

				samplerDescriptorGPU.maxAnisotropy = texture.anisotropy;

			}

			if ( texture.isDepthTexture && texture.compareFunction !== null ) {

				samplerDescriptorGPU.compare = _compareToWebGPU[ texture.compareFunction ];

			}

			const sampler = backend.device.createSampler( samplerDescriptorGPU );

			samplerData = { sampler, usedTimes: 0 };

			this._samplerCache.set( samplerKey, samplerData );

		}

		const textureData = backend.get( texture );

		if ( textureData.sampler !== samplerData.sampler ) {

			// check if previous sampler is unused so it can be deleted

			if ( textureData.sampler !== undefined ) {

				const oldSamplerData = this._samplerCache.get( textureData.samplerKey );
				oldSamplerData.usedTimes --;

				if ( oldSamplerData.usedTimes === 0 ) {

					this._samplerCache.delete( textureData.samplerKey );

				}

			}

			// update to new sampler data

			textureData.samplerKey = samplerKey;
			textureData.sampler = samplerData.sampler;

			samplerData.usedTimes ++;

		}

		return samplerKey;

	}

	/**
	 * Creates a default texture for the given texture that can be used
	 * as a placeholder until the actual texture is ready for usage.
	 *
	 * @param {Texture} texture - The texture to create a default texture for.
	 */
	createDefaultTexture( texture ) {

		let textureGPU;

		const format = getFormat( texture );

		if ( texture.isCubeTexture ) {

			textureGPU = this._getDefaultCubeTextureGPU( format );

		} else {

			textureGPU = this._getDefaultTextureGPU( format );

		}

		this.backend.get( texture ).texture = textureGPU;

	}

	/**
	 * Defines a texture on the GPU for the given texture object.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	createTexture( texture, options = {} ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		if ( textureData.initialized ) {

			throw new Error( 'WebGPUTextureUtils: Texture already initialized.' );

		}

		if ( texture.isExternalTexture ) {

			textureData.texture = texture.sourceTexture;
			textureData.initialized = true;

			return;

		}

		if ( options.needsMipmaps === undefined ) options.needsMipmaps = false;
		if ( options.levels === undefined ) options.levels = 1;
		if ( options.depth === undefined ) options.depth = 1;

		const { width, height, depth, levels } = options;

		if ( texture.isFramebufferTexture ) {

			if ( options.renderTarget ) {

				options.format = this.backend.utils.getCurrentColorFormat( options.renderTarget );

			} else {

				options.format = this.backend.utils.getPreferredCanvasFormat();

			}

		}

		const dimension = this._getDimension( texture );
		const format = texture.internalFormat || options.format || getFormat( texture, backend.device );

		textureData.format = format;

		const { samples, primarySamples, isMSAA } = backend.utils.getTextureSampleData( texture );

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC;

		if ( texture.isStorageTexture === true ) {

			usage |= GPUTextureUsage.STORAGE_BINDING;

		}

		if ( texture.isCompressedTexture !== true && texture.isCompressedArrayTexture !== true && format !== GPUTextureFormat.RGB9E5UFloat ) {

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
			sampleCount: primarySamples,
			dimension: dimension,
			format: format,
			usage: usage
		};

		// texture creation

		if ( format === undefined ) {

			warn( 'WebGPURenderer: Texture format not supported.' );

			this.createDefaultTexture( texture );
			return;

		}

		if ( texture.isCubeTexture ) {

			textureDescriptorGPU.textureBindingViewDimension = GPUTextureViewDimension.Cube;

		}

		textureData.texture = backend.device.createTexture( textureDescriptorGPU );

		if ( isMSAA ) {

			const msaaTextureDescriptorGPU = Object.assign( {}, textureDescriptorGPU );

			msaaTextureDescriptorGPU.label = msaaTextureDescriptorGPU.label + '-msaa';
			msaaTextureDescriptorGPU.sampleCount = samples;
			msaaTextureDescriptorGPU.mipLevelCount = 1; // See https://www.w3.org/TR/webgpu/#texture-creation

			textureData.msaaTexture = backend.device.createTexture( msaaTextureDescriptorGPU );

		}

		textureData.initialized = true;

		textureData.textureDescriptorGPU = textureDescriptorGPU;

	}

	/**
	 * Destroys the GPU data for the given texture object.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {boolean} [isDefaultTexture=false] - Whether the texture uses a default GPU texture or not.
	 */
	destroyTexture( texture, isDefaultTexture = false ) {

		const backend = this.backend;
		const textureData = backend.get( texture );

		if ( textureData.texture !== undefined && isDefaultTexture === false ) textureData.texture.destroy();

		if ( textureData.msaaTexture !== undefined ) textureData.msaaTexture.destroy();

		backend.delete( texture );

	}

	/**
	 * Generates mipmaps for the given texture.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {?GPUCommandEncoder} [encoder=null] - An optional command encoder used to generate mipmaps.
	 */
	generateMipmaps( texture, encoder = null ) {

		const textureData = this.backend.get( texture );

		if ( texture.isCubeTexture ) {

			for ( let i = 0; i < 6; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i, encoder );

			}

		} else {

			const depth = texture.image.depth || 1;

			for ( let i = 0; i < depth; i ++ ) {

				this._generateMipmaps( textureData.texture, textureData.textureDescriptorGPU, i, encoder );

			}

		}

	}

	/**
	 * Returns the color buffer representing the color
	 * attachment of the default framebuffer.
	 *
	 * @return {GPUTexture} The color buffer.
	 */
	getColorBuffer() {

		const backend = this.backend;
		const canvasTarget = backend.renderer.getCanvasTarget();
		const { width, height } = backend.getDrawingBufferSize();
		const samples = backend.renderer.currentSamples;

		const colorTexture = canvasTarget.colorTexture;
		const colorTextureData = backend.get( colorTexture );

		if ( colorTexture.width === width && colorTexture.height === height && colorTexture.samples === samples ) {

			return colorTextureData.texture;

		}

		// recreate

		let colorBuffer = colorTextureData.texture;

		if ( colorBuffer ) colorBuffer.destroy();

		colorBuffer = backend.device.createTexture( {
			label: 'colorBuffer',
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: 1
			},
			sampleCount: backend.utils.getSampleCount( backend.renderer.currentSamples ),
			format: backend.utils.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
		} );

		//

		colorTexture.source.width = width;
		colorTexture.source.height = height;
		colorTexture.samples = samples;

		colorTextureData.texture = colorBuffer;

		return colorBuffer;

	}

	/**
	 * Returns the depth buffer representing the depth
	 * attachment of the default framebuffer.
	 *
	 * @param {boolean} [depth=true] - Whether depth is enabled or not.
	 * @param {boolean} [stencil=false] -  Whether stencil is enabled or not.
	 * @return {GPUTexture} The depth buffer.
	 */
	getDepthBuffer( depth = true, stencil = false ) {

		const backend = this.backend;
		const canvasTarget = backend.renderer.getCanvasTarget();
		const { width, height } = backend.getDrawingBufferSize();
		const samples = backend.renderer.currentSamples;

		const depthTexture = canvasTarget.depthTexture;

		if ( depthTexture.width === width &&
			depthTexture.height === height &&
			depthTexture.samples === samples &&
			depthTexture.depth === depth &&
			depthTexture.stencil === stencil ) {

			return backend.get( depthTexture ).texture;

		}

		//

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

			if ( depthTexture.image.width === width && depthTexture.image.height === height && depthTexture.format === format && depthTexture.type === type && depthTexture.samples === samples ) {

				return depthTextureGPU;

			}

			this.destroyTexture( depthTexture );

		}

		// recreate

		depthTexture.name = 'depthBuffer';
		depthTexture.format = format;
		depthTexture.type = type;
		depthTexture.image.width = width;
		depthTexture.image.height = height;
		depthTexture.samples = samples;

		this.createTexture( depthTexture, { width, height } );

		return backend.get( depthTexture ).texture;

	}

	/**
	 * Uploads the updated texture data to the GPU.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Object} [options={}] - Optional configuration parameter.
	 */
	updateTexture( texture, options ) {

		const textureData = this.backend.get( texture );
		const mipmaps = texture.mipmaps;

		const { textureDescriptorGPU } = textureData;

		if ( texture.isRenderTargetTexture || ( textureDescriptorGPU === undefined /* unsupported texture format */ ) )
			return;

		// transfer texture data

		if ( texture.isDataTexture ) {

			if ( mipmaps.length > 0 ) {

				for ( let i = 0, il = mipmaps.length; i < il; i ++ ) {

					const mipmap = mipmaps[ i ];

					this._copyBufferToTexture( mipmap, textureData.texture, textureDescriptorGPU, 0, texture.flipY, 0, i );

				}


			} else {

				this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY );

			}

		} else if ( texture.isArrayTexture || texture.isDataArrayTexture || texture.isData3DTexture ) {

			for ( let i = 0; i < options.image.depth; i ++ ) {

				this._copyBufferToTexture( options.image, textureData.texture, textureDescriptorGPU, i, texture.flipY, i );

			}

		} else if ( texture.isCompressedTexture || texture.isCompressedArrayTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, textureData.texture, textureDescriptorGPU );

		} else if ( texture.isCubeTexture ) {

			this._copyCubeMapToTexture( texture, textureData.texture, textureDescriptorGPU );

		} else {

			if ( mipmaps.length > 0 ) {

				for ( let i = 0, il = mipmaps.length; i < il; i ++ ) {

					const mipmap = mipmaps[ i ];

					this._copyImageToTexture( mipmap, textureData.texture, textureDescriptorGPU, 0, texture.flipY, texture.premultiplyAlpha, i );

				}


			} else {

				this._copyImageToTexture( options.image, textureData.texture, textureDescriptorGPU, 0, texture.flipY, texture.premultiplyAlpha );

			}

		}

		//

		textureData.version = texture.version;

	}

	/**
	 * Returns texture data as a typed array.
	 *
	 * @async
	 * @param {Texture} texture - The texture to copy.
	 * @param {number} x - The x coordinate of the copy origin.
	 * @param {number} y - The y coordinate of the copy origin.
	 * @param {number} width - The width of the copy.
	 * @param {number} height - The height of the copy.
	 * @param {number} faceIndex - The face index.
	 * @return {Promise<TypedArray>} A Promise that resolves with a typed array when the copy operation has finished.
	 */
	async copyTextureToBuffer( texture, x, y, width, height, faceIndex ) {

		const device = this.backend.device;

		const textureData = this.backend.get( texture );
		const textureGPU = textureData.texture;
		const format = textureData.textureDescriptorGPU.format;
		const bytesPerTexel = this._getBytesPerTexel( format );

		let bytesPerRow = width * bytesPerTexel;
		bytesPerRow = Math.ceil( bytesPerRow / 256 ) * 256; // Align to 256 bytes

		const readBuffer = device.createBuffer(
			{
				size: ( ( height - 1 ) * bytesPerRow ) + ( width * bytesPerTexel ), // see https://github.com/mrdoob/three.js/issues/31658#issuecomment-3229442010
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
			}
		);

		const encoder = device.createCommandEncoder();

		encoder.copyTextureToBuffer(
			{
				texture: textureGPU,
				origin: { x, y, z: faceIndex },
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

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._samplerCache.clear();

	}

	/**
	 * Returns the default GPU texture for the given format.
	 *
	 * @private
	 * @param {string} format - The GPU format.
	 * @return {GPUTexture} The GPU texture.
	 */
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

	/**
	 * Returns the default GPU cube texture for the given format.
	 *
	 * @private
	 * @param {string} format - The GPU format.
	 * @return {GPUTexture} The GPU texture.
	 */
	_getDefaultCubeTextureGPU( format ) {

		let defaultCubeTexture = this.defaultCubeTexture[ format ];

		if ( defaultCubeTexture === undefined ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.createTexture( texture, { width: 1, height: 1, depth: 6 } );

			this.defaultCubeTexture[ format ] = defaultCubeTexture = texture;

		}

		return this.backend.get( defaultCubeTexture ).texture;

	}

	/**
	 * Uploads cube texture image data to the GPU memory.
	 *
	 * @private
	 * @param {CubeTexture} texture - The cube texture.
	 * @param {GPUTexture} textureGPU - The GPU texture.
	 * @param {Object} textureDescriptorGPU - The GPU texture descriptor.
	 */
	_copyCubeMapToTexture( texture, textureGPU, textureDescriptorGPU ) {

		const images = texture.images;
		const mipmaps = texture.mipmaps;

		for ( let i = 0; i < 6; i ++ ) {

			const image = images[ i ];

			const flipIndex = texture.flipY === true ? _flipMap[ i ] : i;

			if ( image.isDataTexture ) {

				this._copyBufferToTexture( image.image, textureGPU, textureDescriptorGPU, flipIndex, texture.flipY );

			} else {

				this._copyImageToTexture( image, textureGPU, textureDescriptorGPU, flipIndex, texture.flipY, texture.premultiplyAlpha );

			}

			for ( let j = 0; j < mipmaps.length; j ++ ) {

				const mipmap = mipmaps[ j ];
				const image = mipmap.images[ i ];

				if ( image.isDataTexture ) {

					this._copyBufferToTexture( image.image, textureGPU, textureDescriptorGPU, flipIndex, texture.flipY, 0, j + 1 );

				} else {

					this._copyImageToTexture( image, textureGPU, textureDescriptorGPU, flipIndex, texture.flipY, texture.premultiplyAlpha, j + 1 );

				}


			}

		}

	}

	/**
	 * Uploads texture image data to the GPU memory.
	 *
	 * @private
	 * @param {HTMLImageElement|ImageBitmap|HTMLCanvasElement} image - The image data.
	 * @param {GPUTexture} textureGPU - The GPU texture.
	 * @param {Object} textureDescriptorGPU - The GPU texture descriptor.
	 * @param {number} originDepth - The origin depth.
	 * @param {boolean} flipY - Whether to flip texture data along their vertical axis or not.
	 * @param {boolean} premultiplyAlpha - Whether the texture should have its RGB channels premultiplied by the alpha channel or not.
	 * @param {number} [mipLevel=0] - The mip level where the data should be copied to.
	 */
	_copyImageToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY, premultiplyAlpha, mipLevel = 0 ) {

		const device = this.backend.device;

		const width = ( mipLevel > 0 ) ? image.width : textureDescriptorGPU.size.width;
		const height = ( mipLevel > 0 ) ? image.height : textureDescriptorGPU.size.height;

		try {

			device.queue.copyExternalImageToTexture(
				{
					source: image,
					flipY: flipY
				}, {
					texture: textureGPU,
					mipLevel: mipLevel,
					origin: { x: 0, y: 0, z: originDepth },
					premultipliedAlpha: premultiplyAlpha
				}, {
					width: width,
					height: height,
					depthOrArrayLayers: 1
				}
			);

			// try/catch has been added to fix bad video frame data on certain devices, see #32391

		} catch ( _ ) {}

	}

	/**
	 * Returns the pass utils singleton.
	 *
	 * @private
	 * @return {WebGPUTexturePassUtils} The utils instance.
	 */
	_getPassUtils() {

		let passUtils = this._passUtils;

		if ( passUtils === null ) {

			this._passUtils = passUtils = new WebGPUTexturePassUtils( this.backend.device );

		}

		return passUtils;

	}

	/**
	 * Generates mipmaps for the given GPU texture.
	 *
	 * @private
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {Object} textureDescriptorGPU - The texture descriptor.
	 * @param {number} [baseArrayLayer=0] - The index of the first array layer accessible to the texture view.
	 * @param {?GPUCommandEncoder} [encoder=null] - An optional command encoder used to generate mipmaps.
	 */
	_generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer = 0, encoder = null ) {

		this._getPassUtils().generateMipmaps( textureGPU, textureDescriptorGPU, baseArrayLayer, encoder );

	}

	/**
	 * Flip the contents of the given GPU texture along its vertical axis.
	 *
	 * @private
	 * @param {GPUTexture} textureGPU - The GPU texture object.
	 * @param {Object} textureDescriptorGPU - The texture descriptor.
	 * @param {number} [originDepth=0] - The origin depth.
	 */
	_flipY( textureGPU, textureDescriptorGPU, originDepth = 0 ) {

		this._getPassUtils().flipY( textureGPU, textureDescriptorGPU, originDepth );

	}

	/**
	 * Uploads texture buffer data to the GPU memory.
	 *
	 * @private
	 * @param {Object} image - An object defining the image buffer data.
	 * @param {GPUTexture} textureGPU - The GPU texture.
	 * @param {Object} textureDescriptorGPU - The GPU texture descriptor.
	 * @param {number} originDepth - The origin depth.
	 * @param {boolean} flipY - Whether to flip texture data along their vertical axis or not.
	 * @param {number} [depth=0] - The depth offset when copying array or 3D texture data.
	 * @param {number} [mipLevel=0] - The mip level where the data should be copied to.
	 */
	_copyBufferToTexture( image, textureGPU, textureDescriptorGPU, originDepth, flipY, depth = 0, mipLevel = 0 ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
		// @TODO: Consider to support valid buffer layouts with other formats like RGB

		const device = this.backend.device;

		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( textureDescriptorGPU.format );
		const bytesPerRow = image.width * bytesPerTexel;

		device.queue.writeTexture(
			{
				texture: textureGPU,
				mipLevel: mipLevel,
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

	/**
	 * Uploads compressed texture data to the GPU memory.
	 *
	 * @private
	 * @param {Array<Object>} mipmaps - An array with mipmap data.
	 * @param {GPUTexture} textureGPU - The GPU texture.
	 * @param {Object} textureDescriptorGPU - The GPU texture descriptor.
	 */
	_copyCompressedBufferToTexture( mipmaps, textureGPU, textureDescriptorGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const device = this.backend.device;

		const blockData = this._getBlockData( textureDescriptorGPU.format );
		const isArrayTexture = textureDescriptorGPU.size.depthOrArrayLayers > 1;

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;
			const depth = isArrayTexture ? textureDescriptorGPU.size.depthOrArrayLayers : 1;

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

	/**
	 * This method is only relevant for compressed texture formats. It returns a block
	 * data descriptor for the given GPU compressed texture format.
	 *
	 * @private
	 * @param {string} format - The GPU compressed texture format.
	 * @return {Object} The block data descriptor.
	 */
	_getBlockData( format ) {

		if ( format === GPUTextureFormat.BC1RGBAUnorm || format === GPUTextureFormat.BC1RGBAUnormSRGB ) return { byteLength: 8, width: 4, height: 4 }; // DXT1
		if ( format === GPUTextureFormat.BC2RGBAUnorm || format === GPUTextureFormat.BC2RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT3
		if ( format === GPUTextureFormat.BC3RGBAUnorm || format === GPUTextureFormat.BC3RGBAUnormSRGB ) return { byteLength: 16, width: 4, height: 4 }; // DXT5
		if ( format === GPUTextureFormat.BC4RUnorm || format === GPUTextureFormat.BC4RSnorm ) return { byteLength: 8, width: 4, height: 4 }; // RGTC1
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

	/**
	 * Converts the three.js uv wrapping constants to GPU address mode constants.
	 *
	 * @private
	 * @param {number} value - The three.js constant defining a uv wrapping mode.
	 * @return {string} The GPU address mode.
	 */
	_convertAddressMode( value ) {

		let addressMode = GPUAddressMode.ClampToEdge;

		if ( value === RepeatWrapping ) {

			addressMode = GPUAddressMode.Repeat;

		} else if ( value === MirroredRepeatWrapping ) {

			addressMode = GPUAddressMode.MirrorRepeat;

		}

		return addressMode;

	}

	/**
	 * Converts the three.js filter constants to GPU filter constants.
	 *
	 * @private
	 * @param {number} value - The three.js constant defining a filter mode.
	 * @return {string} The GPU filter mode.
	 */
	_convertFilterMode( value ) {

		let filterMode = GPUFilterMode.Linear;

		if ( value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter ) {

			filterMode = GPUFilterMode.Nearest;

		}

		return filterMode;

	}

	/**
	 * Returns the bytes-per-texel value for the given GPU texture format.
	 *
	 * @private
	 * @param {string} format - The GPU texture format.
	 * @return {number} The bytes-per-texel.
	 */
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

	/**
	 * Returns the corresponding typed array type for the given GPU texture format.
	 *
	 * @private
	 * @param {string} format - The GPU texture format.
	 * @return {TypedArray.constructor} The typed array type.
	 */
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
		if ( format === GPUTextureFormat.RGBA8Unorm || format === GPUTextureFormat.RGBA8UnormSRGB ) return Uint8Array;
		if ( format === GPUTextureFormat.RGBA8Snorm ) return Int8Array;


		if ( format === GPUTextureFormat.R16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.R16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RG16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RG16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.RGBA16Uint ) return Uint16Array;
		if ( format === GPUTextureFormat.RGBA16Sint ) return Int16Array;
		if ( format === GPUTextureFormat.R16Float ) return Uint16Array;
		if ( format === GPUTextureFormat.RG16Float ) return Uint16Array;
		if ( format === GPUTextureFormat.RGBA16Float ) return Uint16Array;


		if ( format === GPUTextureFormat.R32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.R32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.R32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RG32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RG32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RG32Float ) return Float32Array;
		if ( format === GPUTextureFormat.RGBA32Uint ) return Uint32Array;
		if ( format === GPUTextureFormat.RGBA32Sint ) return Int32Array;
		if ( format === GPUTextureFormat.RGBA32Float ) return Float32Array;

		if ( format === GPUTextureFormat.BGRA8Unorm || format === GPUTextureFormat.BGRA8UnormSRGB ) return Uint8Array;
		if ( format === GPUTextureFormat.RGB10A2Unorm ) return Uint32Array;
		if ( format === GPUTextureFormat.RGB9E5UFloat ) return Uint32Array;
		if ( format === GPUTextureFormat.RG11B10UFloat ) return Uint32Array;

		if ( format === GPUTextureFormat.Depth32Float ) return Float32Array;
		if ( format === GPUTextureFormat.Depth24Plus ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth24PlusStencil8 ) return Uint32Array;
		if ( format === GPUTextureFormat.Depth32FloatStencil8 ) return Float32Array;

	}

	/**
	 * Returns the GPU dimensions for the given texture.
	 *
	 * @private
	 * @param {Texture} texture - The texture.
	 * @return {string} The GPU dimension.
	 */
	_getDimension( texture ) {

		let dimension;

		if ( texture.is3DTexture || texture.isData3DTexture ) {

			dimension = GPUTextureDimension.ThreeD;

		} else {

			dimension = GPUTextureDimension.TwoD;

		}

		return dimension;

	}

}

/**
 * Returns the GPU format for the given texture.
 *
 * @param {Texture} texture - The texture.
 * @param {?GPUDevice} [device=null] - The GPU device which is used for feature detection.
 * It is not necessary to apply the device for most formats.
 * @return {string} The GPU format.
 */
export function getFormat( texture, device = null ) {

	const format = texture.format;
	const type = texture.type;
	const colorSpace = texture.colorSpace;
	const transfer = ColorManagement.getTransfer( colorSpace );

	let formatGPU;

	if ( texture.isCompressedTexture === true || texture.isCompressedArrayTexture === true ) {

		switch ( format ) {

			case RGB_S3TC_DXT1_Format:
			case RGBA_S3TC_DXT1_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
				break;

			case RGBA_S3TC_DXT3_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
				break;

			case RGBA_S3TC_DXT5_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
				break;

			case RED_RGTC1_Format:
				formatGPU = GPUTextureFormat.BC4RUnorm;
				break;

			case SIGNED_RED_RGTC1_Format:
				formatGPU = GPUTextureFormat.BC4RSnorm;
				break;

			case RED_GREEN_RGTC2_Format:
				formatGPU = GPUTextureFormat.BC5RGUnorm;
				break;

			case SIGNED_RED_GREEN_RGTC2_Format:
				formatGPU = GPUTextureFormat.BC5RGSnorm;
				break;

			case RGBA_BPTC_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.BC7RGBAUnormSRGB : GPUTextureFormat.BC7RGBAUnorm;
				break;

			case RGB_ETC2_Format:
			case RGB_ETC1_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ETC2RGB8UnormSRGB : GPUTextureFormat.ETC2RGB8Unorm;
				break;

			case RGBA_ETC2_EAC_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ETC2RGBA8UnormSRGB : GPUTextureFormat.ETC2RGBA8Unorm;
				break;

			case R11_EAC_Format:
				formatGPU = GPUTextureFormat.EACR11Unorm;
				break;

			case SIGNED_R11_EAC_Format:
				formatGPU = GPUTextureFormat.EACR11Snorm;
				break;

			case RG11_EAC_Format:
				formatGPU = GPUTextureFormat.EACRG11Unorm;
				break;

			case SIGNED_RG11_EAC_Format:
				formatGPU = GPUTextureFormat.EACRG11Snorm;
				break;

			case RGBA_ASTC_4x4_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC4x4UnormSRGB : GPUTextureFormat.ASTC4x4Unorm;
				break;

			case RGBA_ASTC_5x4_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC5x4UnormSRGB : GPUTextureFormat.ASTC5x4Unorm;
				break;

			case RGBA_ASTC_5x5_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC5x5UnormSRGB : GPUTextureFormat.ASTC5x5Unorm;
				break;

			case RGBA_ASTC_6x5_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC6x5UnormSRGB : GPUTextureFormat.ASTC6x5Unorm;
				break;

			case RGBA_ASTC_6x6_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC6x6UnormSRGB : GPUTextureFormat.ASTC6x6Unorm;
				break;

			case RGBA_ASTC_8x5_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC8x5UnormSRGB : GPUTextureFormat.ASTC8x5Unorm;
				break;

			case RGBA_ASTC_8x6_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC8x6UnormSRGB : GPUTextureFormat.ASTC8x6Unorm;
				break;

			case RGBA_ASTC_8x8_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC8x8UnormSRGB : GPUTextureFormat.ASTC8x8Unorm;
				break;

			case RGBA_ASTC_10x5_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC10x5UnormSRGB : GPUTextureFormat.ASTC10x5Unorm;
				break;

			case RGBA_ASTC_10x6_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC10x6UnormSRGB : GPUTextureFormat.ASTC10x6Unorm;
				break;

			case RGBA_ASTC_10x8_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC10x8UnormSRGB : GPUTextureFormat.ASTC10x8Unorm;
				break;

			case RGBA_ASTC_10x10_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC10x10UnormSRGB : GPUTextureFormat.ASTC10x10Unorm;
				break;

			case RGBA_ASTC_12x10_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC12x10UnormSRGB : GPUTextureFormat.ASTC12x10Unorm;
				break;

			case RGBA_ASTC_12x12_Format:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.ASTC12x12UnormSRGB : GPUTextureFormat.ASTC12x12Unorm;
				break;

			case RGBAFormat:
				formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
				break;

			default:
				error( 'WebGPURenderer: Unsupported texture format.', format );

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
						formatGPU = ( transfer === SRGBTransfer ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
						break;

					case HalfFloatType:
						formatGPU = GPUTextureFormat.RGBA16Float;
						break;

					case FloatType:
						formatGPU = GPUTextureFormat.RGBA32Float;
						break;

					default:
						error( 'WebGPURenderer: Unsupported texture type with RGBAFormat.', type );

				}

				break;

			case RGBFormat:

				switch ( type ) {

					case UnsignedInt5999Type:
						formatGPU = GPUTextureFormat.RGB9E5UFloat;
						break;

					case UnsignedInt101111Type:
						formatGPU = GPUTextureFormat.RG11B10UFloat;
						break;

					default:
						error( 'WebGPURenderer: Unsupported texture type with RGBFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with RedFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with RGFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with DepthFormat.', type );

				}

				break;

			case DepthStencilFormat:

				switch ( type ) {

					case UnsignedInt248Type:
						formatGPU = GPUTextureFormat.Depth24PlusStencil8;
						break;

					case FloatType:

						if ( device && device.features.has( GPUFeatureName.Depth32FloatStencil8 ) === false ) {

							error( 'WebGPURenderer: Depth textures with DepthStencilFormat + FloatType can only be used with the "depth32float-stencil8" GPU feature.' );

						}

						formatGPU = GPUTextureFormat.Depth32FloatStencil8;

						break;

					default:
						error( 'WebGPURenderer: Unsupported texture type with DepthStencilFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with RedIntegerFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with RGIntegerFormat.', type );

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
						error( 'WebGPURenderer: Unsupported texture type with RGBAIntegerFormat.', type );

				}

				break;

			default:
				error( 'WebGPURenderer: Unsupported texture format.', format );

		}

	}

	return formatGPU;

}

export default WebGPUTextureUtils;
