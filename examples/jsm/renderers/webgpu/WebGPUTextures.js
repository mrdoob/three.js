import { GPUTextureFormat, GPUAddressMode, GPUFilterMode, GPUTextureDimension, GPUFeatureName } from './constants.js';
import { VideoTexture, CubeTexture, Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter, RepeatWrapping, MirroredRepeatWrapping, RGB_ETC2_Format, RGBA_ETC2_EAC_Format,
	RGBAFormat, RedFormat, RGFormat, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, UnsignedByteType, FloatType, HalfFloatType, SRGBColorSpace, DepthFormat, DepthStencilFormat, DepthTexture,
	RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format,
	RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, UnsignedIntType, UnsignedShortType, UnsignedInt248Type
} from 'three';
import WebGPUTextureUtils from './WebGPUTextureUtils.js';

class WebGPUTextures {

	constructor( device, properties, info ) {

		this.device = device;
		this.properties = properties;
		this.info = info;

		this.defaultTexture = null;
		this.depthDefaultTexture = null;
		this.defaultVideoTexture = null;
		this.defaultCubeTexture = null;
		this.defaultSampler = null;

		this.samplerCache = new Map();
		this.utils = null;

	}

	getDefaultSampler() {

		if ( this.defaultSampler === null ) {

			this.defaultSampler = this.device.createSampler( {} );

		}

		return this.defaultSampler;

	}

	getDefaultDepthTexture() {

		if ( this.depthDefaultTexture === null ) {

			const depthTexture = new DepthTexture();
			depthTexture.image.width = 1;
			depthTexture.image.height = 1;

			this._uploadTexture( depthTexture );

			this.depthDefaultTexture = this.getTextureGPU( depthTexture );

		}

		return this.depthDefaultTexture;

	}

	getDefaultTexture() {

		if ( this.defaultTexture === null ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this._uploadTexture( texture );

			this.defaultTexture = this.getTextureGPU( texture );

		}

		return this.defaultTexture;

	}

	getDefaultVideoTexture() {

		if ( this.defaultVideoTexture === null ) {

			const video = document.getElementById( 'video' );

			const texture = new VideoTexture( video );
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this._uploadVideoTexture( texture );

			this.defaultVideoTexture = this.getTextureGPU( texture );

		}

		return this.defaultVideoTexture;

	}

	getDefaultCubeTexture() {

		if ( this.defaultCubeTexture === null ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this._uploadTexture( texture );

			this.defaultCubeTexture = this.getTextureGPU( texture );

		}

		return this.defaultCubeTexture;

	}

	getTextureGPU( texture ) {

		const textureProperties = this.properties.get( texture );

		return textureProperties.textureGPU;

	}

	getSampler( texture ) {

		const textureProperties = this.properties.get( texture );

		return textureProperties.samplerGPU;

	}

	updateTexture( texture ) {

		let needsUpdate = false;

		const textureProperties = this.properties.get( texture );

		if ( texture.version > 0 && textureProperties.version !== texture.version ) {

			const image = texture.image;

			if ( image === undefined ) {

				console.warn( 'THREE.WebGPURenderer: Texture marked for update but image is undefined.' );

			} else if ( image.complete === false ) {

				console.warn( 'THREE.WebGPURenderer: Texture marked for update but image is incomplete.' );

			} else {

				// texture init

				if ( textureProperties.initialized === undefined ) {

					textureProperties.initialized = true;

					const disposeCallback = onTextureDispose.bind( this );
					textureProperties.disposeCallback = disposeCallback;

					texture.addEventListener( 'dispose', disposeCallback );

					this.info.memory.textures ++;

				}

				//

				if ( texture.isVideoTexture ) {

					needsUpdate = this._uploadVideoTexture( texture );

				} else {

					needsUpdate = this._uploadTexture( texture );

				}

			}

		}

		// if the texture is used for RTT, it's necessary to init it once so the binding
		// group's resource definition points to the respective GPUTexture

		if ( textureProperties.initializedRTT === false ) {

			textureProperties.initializedRTT = true;
			needsUpdate = true;

		}

		return needsUpdate;

	}

	updateSampler( texture ) {

		const array = [];

		array.push( texture.wrapS );
		array.push( texture.wrapT );
		array.push( texture.wrapR );
		array.push( texture.magFilter );
		array.push( texture.minFilter );
		array.push( texture.anisotropy );

		const key = array.join();
		let samplerGPU = this.samplerCache.get( key );

		if ( samplerGPU === undefined ) {

			samplerGPU = this.device.createSampler( {
				addressModeU: this._convertAddressMode( texture.wrapS ),
				addressModeV: this._convertAddressMode( texture.wrapT ),
				addressModeW: this._convertAddressMode( texture.wrapR ),
				magFilter: this._convertFilterMode( texture.magFilter ),
				minFilter: this._convertFilterMode( texture.minFilter ),
				mipmapFilter: this._convertFilterMode( texture.minFilter ),
				maxAnisotropy: texture.anisotropy
			} );

			this.samplerCache.set( key, samplerGPU );

		}

		const textureProperties = this.properties.get( texture );
		textureProperties.samplerGPU = samplerGPU;

	}

	initRenderTarget( renderTarget ) {

		const properties = this.properties;
		const renderTargetProperties = properties.get( renderTarget );

		if ( renderTargetProperties.initialized === undefined ) {

			const device = this.device;

			const width = renderTarget.width;
			const height = renderTarget.height;

			const texture = renderTarget.texture;

			const colorTextureFormat = texture.internalFormat || this._getFormat( texture );
			const label = texture.name ? '_' + texture.name : '';
			const needsMipmaps = this._needsMipmaps( texture );
			const mipLevelCount = this._getMipLevelCount( texture, width, height, needsMipmaps );

			const colorTextureGPU = device.createTexture( {
				label: 'renderTarget' + label,
				size: {
					width: width,
					height: height,
					depthOrArrayLayers: 1
				},
				mipLevelCount: mipLevelCount,
				format: colorTextureFormat,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
			} );

			this.info.memory.textures ++;

			renderTargetProperties.colorTextureGPU = colorTextureGPU;
			renderTargetProperties.colorTextureFormat = colorTextureFormat;

			// When the ".texture" or ".depthTexture" property of a render target is used as a map,
			// the renderer has to find the respective GPUTexture objects to setup the bind groups.
			// Since it's not possible to see just from a texture object whether it belongs to a render
			// target or not, we need the initializedRTT flag.

			const textureProperties = properties.get( texture );
			textureProperties.textureGPU = colorTextureGPU;
			textureProperties.initializedRTT = false;

			if ( renderTarget.depthBuffer === true ) {

				const depthTextureFormat = renderTarget.depthTexture !== null ? this._getFormat( renderTarget.depthTexture ) : GPUTextureFormat.Depth24PlusStencil8;

				const depthTextureGPU = device.createTexture( {
					label: 'renderTarget' + label + '_depthBuffer',
					size: {
						width: width,
						height: height,
						depthOrArrayLayers: 1
					},
					format: depthTextureFormat,
					usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
				} );

				this.info.memory.textures ++;

				renderTargetProperties.depthTextureGPU = depthTextureGPU;
				renderTargetProperties.depthTextureFormat = depthTextureFormat;

				if ( renderTarget.depthTexture !== null ) {

					const depthTextureProperties = properties.get( renderTarget.depthTexture );
					depthTextureProperties.textureGPU = depthTextureGPU;
					depthTextureProperties.initializedRTT = false;

				}

			}

			//

			const disposeCallback = onRenderTargetDispose.bind( this );
			renderTargetProperties.disposeCallback = disposeCallback;

			renderTarget.addEventListener( 'dispose', disposeCallback );

			//

			renderTargetProperties.initialized = true;

		}

	}

	dispose() {

		this.samplerCache.clear();

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

	_uploadVideoTexture( texture ) {

		const device = this.device;

		const textureProperties = this.properties.get( texture );

		const textureGPU = device.importExternalTexture( {
			source: texture.source.data
		} );

		textureProperties.textureGPU = textureGPU;
		//textureProperties.version = texture.version; // @TODO: Force update for now, study a better solution soon using native VideoTexture.update() to fix warns

		return true;

	}

	_uploadTexture( texture ) {

		let needsUpdate = false;

		const device = this.device;
		const image = texture.image;

		const textureProperties = this.properties.get( texture );

		const { width, height, depth } = this._getSize( texture );
		const needsMipmaps = this._needsMipmaps( texture );
		const dimension = this._getDimension( texture );
		const mipLevelCount = this._getMipLevelCount( texture, width, height, needsMipmaps );
		const format = texture.internalFormat || this._getFormat( texture );

		let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;

		if ( needsMipmaps ) {

			// current mipmap generation requires RENDER_ATTACHMENT

			usage |= GPUTextureUsage.RENDER_ATTACHMENT;

		}

		const textureGPUDescriptor = {
			label: texture.name,
			size: {
				width: width,
				height: height,
				depthOrArrayLayers: depth,
			},
			mipLevelCount: mipLevelCount,
			sampleCount: 1,
			dimension: dimension,
			format: format,
			usage: usage
		};

		// texture creation

		let textureGPU = textureProperties.textureGPU;

		if ( textureGPU === undefined ) {

			textureGPU = device.createTexture( textureGPUDescriptor );

			needsUpdate = true;

		}

		// transfer texture data

		if ( texture.isDataTexture || texture.isDataArrayTexture || texture.isData3DTexture ) {

			this._copyBufferToTexture( image, textureGPU, textureGPUDescriptor, needsMipmaps );

		} else if ( texture.isCompressedTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, textureGPU, textureGPUDescriptor );

		} else if ( texture.isCubeTexture ) {

			if ( image.length === 6 ) {

				this._copyCubeMapToTexture( image, texture, textureGPU, textureGPUDescriptor, needsMipmaps );

			}

		} else if ( texture.isRenderTargetTexture ) {

			if ( needsMipmaps === true ) this._generateMipmaps( textureGPU, textureGPUDescriptor );

		} else if ( texture.isDepthTexture !== true && image !== null ) {

			this._copyImageToTexture( image, texture, textureGPU, textureGPUDescriptor, needsMipmaps );

		}

		//

		textureProperties.textureGPU = textureGPU;
		textureProperties.version = texture.version;

		return needsUpdate;

	}

	_copyBufferToTexture( image, textureGPU, textureGPUDescriptor, needsMipmaps, originDepth = 0 ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
		// @TODO: Consider to support valid buffer layouts with other formats like RGB

		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( textureGPUDescriptor.format );
		const bytesPerRow = image.width * bytesPerTexel;

		this.device.queue.writeTexture(
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

		if ( needsMipmaps === true ) this._generateMipmaps( textureGPU, textureGPUDescriptor, originDepth );

	}

	_copyCubeMapToTexture( images, texture, textureGPU, textureGPUDescriptor, needsMipmaps ) {

		for ( let i = 0; i < 6; i ++ ) {

			const image = images[ i ];

			if ( image.isDataTexture ) {

				this._copyBufferToTexture( image.image, textureGPU, textureGPUDescriptor, needsMipmaps, i );

			} else {

				this._copyImageToTexture( image, texture, textureGPU, textureGPUDescriptor, needsMipmaps, i );

			}

		}

	}

	_copyExternalImageToTexture( image, textureGPU, textureGPUDescriptor, needsMipmaps, originDepth = 0 ) {

		this.device.queue.copyExternalImageToTexture(
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

		if ( needsMipmaps ) this._generateMipmaps( textureGPU, textureGPUDescriptor, originDepth );

	}

	_copyCompressedBufferToTexture( mipmaps, textureGPU, textureGPUDescriptor ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const blockData = this._getBlockData( textureGPUDescriptor.format );

		for ( let i = 0; i < mipmaps.length; i ++ ) {

			const mipmap = mipmaps[ i ];

			const width = mipmap.width;
			const height = mipmap.height;

			const bytesPerRow = Math.ceil( width / blockData.width ) * blockData.byteLength;

			this.device.queue.writeTexture(
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

	_generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer ) {

		if ( this.utils === null ) {

			this.utils = new WebGPUTextureUtils( this.device ); // only create this helper if necessary

		}

		this.utils.generateMipmaps( textureGPU, textureGPUDescriptor, baseArrayLayer );

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

	_getDimension( texture ) {

		let dimension;

		if ( texture.isData3DTexture ) {

			dimension = GPUTextureDimension.ThreeD;

		} else {

			dimension = GPUTextureDimension.TwoD;

		}

		return dimension;

	}

	_getFormat( texture ) {

		const format = texture.format;
		const type = texture.type;
		const colorSpace = texture.colorSpace;

		let formatGPU;

		if ( texture.isCompressedTexture === true ) {

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

	_isHTMLImage( image ) {

		return ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) || ( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement );

	}

	_copyImageToTexture( image, texture, textureGPU, textureGPUDescriptor, needsMipmaps, originDepth ) {

		if ( this._isHTMLImage( image ) ) {

			this._getImageBitmapFromHTML( image, texture ).then( imageBitmap => {

				this._copyExternalImageToTexture( imageBitmap, textureGPU, textureGPUDescriptor, needsMipmaps, originDepth );

			} );

		} else {

			// assume ImageBitmap

			this._copyExternalImageToTexture( image, textureGPU, textureGPUDescriptor, needsMipmaps, originDepth );

		}

	}

	_getImageBitmapFromHTML( image, texture ) {

		const width = image.width;
		const height = image.height;

		const options = {};

		options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';
		options.premultiplyAlpha = ( texture.premultiplyAlpha === true ) ? 'premultiply' : 'default';

		return createImageBitmap( image, 0, 0, width, height, options );

	}

	_getImageBitmap( image, texture ) {

		const width = image.width;
		const height = image.height;

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ) {

			const options = {};

			options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';
			options.premultiplyAlpha = ( texture.premultiplyAlpha === true ) ? 'premultiply' : 'default';

			return createImageBitmap( image, 0, 0, width, height, options );

		} else {

			// assume ImageBitmap

			return Promise.resolve( image );

		}

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

		return ( texture.isCompressedTexture !== true ) && ( texture.generateMipmaps === true ) && ( texture.minFilter !== NearestFilter ) && ( texture.minFilter !== LinearFilter );

	}

}

function onRenderTargetDispose( event ) {

	const renderTarget = event.target;
	const properties = this.properties;

	const renderTargetProperties = properties.get( renderTarget );

	renderTarget.removeEventListener( 'dispose', renderTargetProperties.disposeCallback );

	renderTargetProperties.colorTextureGPU.destroy();
	properties.remove( renderTarget.texture );

	this.info.memory.textures --;

	if ( renderTarget.depthBuffer === true ) {

		renderTargetProperties.depthTextureGPU.destroy();

		this.info.memory.textures --;

		if ( renderTarget.depthTexture !== null ) {

			properties.remove( renderTarget.depthTexture );

		}

	}

	properties.remove( renderTarget );

}

function onTextureDispose( event ) {

	const texture = event.target;

	const textureProperties = this.properties.get( texture );
	textureProperties.textureGPU.destroy();

	texture.removeEventListener( 'dispose', textureProperties.disposeCallback );

	this.properties.remove( texture );

	this.info.memory.textures --;

}

export default WebGPUTextures;
