import { GPUTextureFormat, GPUAddressMode, GPUFilterMode, GPUTextureDimension } from './constants.js';
import { CubeTexture, Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter, RepeatWrapping, MirroredRepeatWrapping,
	RGBFormat, RGBAFormat, RedFormat, RGFormat, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, UnsignedByteType, FloatType, HalfFloatType, sRGBEncoding
} from 'three';
import WebGPUTextureUtils from './WebGPUTextureUtils.js';

class WebGPUTextures {

	constructor( device, properties, info, glslang ) {

		this.device = device;
		this.properties = properties;
		this.info = info;
		this.glslang = glslang;

		this.defaultTexture = null;
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

	getDefaultTexture() {

		if ( this.defaultTexture === null ) {

			const texture = new Texture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.defaultTexture = this._createTexture( texture );

		}

		return this.defaultTexture;

	}

	getDefaultCubeTexture() {

		if ( this.defaultCubeTexture === null ) {

			const texture = new CubeTexture();
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;

			this.defaultCubeTexture = this._createTexture( texture );

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

		let forceUpdate = false;

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

				// texture creation

				if ( textureProperties.textureGPU !== undefined ) {

					// @TODO: Avoid calling of destroy() in certain scenarios. When only the contents of a texture
					// are updated, a buffer upload should be sufficient. However, if the user changes
					// the dimensions of the texture, format or usage, a new instance of GPUTexture is required.

					textureProperties.textureGPU.destroy();

				}

				textureProperties.textureGPU = this._createTexture( texture );
				textureProperties.version = texture.version;
				forceUpdate = true;

			}

		}

		// if the texture is used for RTT, it's necessary to init it once so the binding
		// group's resource definition points to the respective GPUTexture

		if ( textureProperties.initializedRTT === false ) {

			textureProperties.initializedRTT = true;
			forceUpdate = true;

		}

		return forceUpdate;

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
			const colorTextureFormat = this._getFormat( renderTarget.texture );

			const colorTextureGPU = device.createTexture( {
				size: {
					width: width,
					height: height,
					depthOrArrayLayers: 1
				},
				format: colorTextureFormat,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.SAMPLED
			} );

			this.info.memory.textures ++;

			renderTargetProperties.colorTextureGPU = colorTextureGPU;
			renderTargetProperties.colorTextureFormat = colorTextureFormat;

			// When the ".texture" or ".depthTexture" property of a render target is used as a map,
			// the renderer has to find the respective GPUTexture objects to setup the bind groups.
			// Since it's not possible to see just from a texture object whether it belongs to a render
			// target or not, we need the initializedRTT flag.

			const textureProperties = properties.get( renderTarget.texture );
			textureProperties.textureGPU = colorTextureGPU;
			textureProperties.initializedRTT = false;

			if ( renderTarget.depthBuffer === true ) {

				const depthTextureFormat = GPUTextureFormat.Depth24PlusStencil8; // @TODO: Make configurable

				const depthTextureGPU = device.createTexture( {
					size: {
						width: width,
						height: height,
						depthOrArrayLayers: 1
					},
					format: depthTextureFormat,
					usage: GPUTextureUsage.RENDER_ATTACHMENT
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

	_createTexture( texture ) {

		const device = this.device;
		const image = texture.image;

		const { width, height, depth } = this._getSize( texture );
		const needsMipmaps = this._needsMipmaps( texture );
		const dimension = this._getDimension( texture );
		const mipLevelCount = this._getMipLevelCount( texture, width, height, needsMipmaps );
		const format = this._getFormat( texture );

		let usage = GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST;

		if ( needsMipmaps === true ) {

			// current mipmap generation requires RENDER_ATTACHMENT

			usage |= GPUTextureUsage.RENDER_ATTACHMENT;

		}

		// texture creation

		const textureGPUDescriptor = {
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
		const textureGPU = device.createTexture( textureGPUDescriptor );

		// transfer texture data

		if ( texture.isDataTexture || texture.isDataTexture2DArray || texture.isDataTexture3D ) {

			this._copyBufferToTexture( image, format, textureGPU );

			if ( needsMipmaps === true ) this._generateMipmaps( textureGPU, textureGPUDescriptor );

		} else if ( texture.isCompressedTexture ) {

			this._copyCompressedBufferToTexture( texture.mipmaps, format, textureGPU );

		} else if ( texture.isCubeTexture ) {

			this._copyCubeMapToTexture( image, texture, textureGPU );

		} else {

			if ( image !== undefined ) {

				// assume HTMLImageElement, HTMLCanvasElement or ImageBitmap

				this._getImageBitmap( image, texture ).then( imageBitmap => {

					this._copyExternalImageToTexture( imageBitmap, textureGPU );

					if ( needsMipmaps === true ) this._generateMipmaps( textureGPU, textureGPUDescriptor );

				} );

			}

		}

		return textureGPU;

	}

	_copyBufferToTexture( image, format, textureGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()
		// @TODO: Consider to support valid buffer layouts with other formats like RGB

		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( format );
		const bytesPerRow = Math.ceil( image.width * bytesPerTexel / 256 ) * 256;

		this.device.queue.writeTexture(
			{
				texture: textureGPU,
				mipLevel: 0
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

	}

	_copyCubeMapToTexture( images, texture, textureGPU ) {

		for ( let i = 0; i < images.length; i ++ ) {

			const image = images[ i ];

			this._getImageBitmap( image, texture ).then( imageBitmap => {

				this._copyExternalImageToTexture( imageBitmap, textureGPU, { x: 0, y: 0, z: i } );

			} );

		}

	}

	_copyExternalImageToTexture( image, textureGPU, origin = { x: 0, y: 0, z: 0 } ) {

		this.device.queue.copyExternalImageToTexture(
			{
				source: image
			}, {
				texture: textureGPU,
				mipLevel: 0,
				origin: origin
			}, {
				width: image.width,
				height: image.height,
				depthOrArrayLayers: 1
			}
		);

	}

	_copyCompressedBufferToTexture( mipmaps, format, textureGPU ) {

		// @TODO: Consider to use GPUCommandEncoder.copyBufferToTexture()

		const blockData = this._getBlockData( format );

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
					depthOrArrayLayers: 1,
				} );

		}

	}

	_generateMipmaps( textureGPU, textureGPUDescriptor ) {

		if ( this.utils === null ) {

			this.utils = new WebGPUTextureUtils( this.device, this.glslang ); // only create this helper if necessary

		}

		this.utils.generateMipmaps( textureGPU, textureGPUDescriptor );

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

		if ( texture.isDataTexture3D ) {

			dimension = GPUTextureDimension.ThreeD;

		} else {

			dimension = GPUTextureDimension.TwoD;

		}

		return dimension;

	}

	_getFormat( texture ) {

		const format = texture.format;
		const type = texture.type;
		const encoding = texture.encoding;

		let formatGPU;

		switch ( format ) {

			case RGBA_S3TC_DXT1_Format:
				formatGPU = ( encoding === sRGBEncoding ) ? GPUTextureFormat.BC1RGBAUnormSRGB : GPUTextureFormat.BC1RGBAUnorm;
				break;

			case RGBA_S3TC_DXT3_Format:
				formatGPU = ( encoding === sRGBEncoding ) ? GPUTextureFormat.BC2RGBAUnormSRGB : GPUTextureFormat.BC2RGBAUnorm;
				break;

			case RGBA_S3TC_DXT5_Format:
				formatGPU = ( encoding === sRGBEncoding ) ? GPUTextureFormat.BC3RGBAUnormSRGB : GPUTextureFormat.BC3RGBAUnorm;
				break;

			case RGBFormat:
			case RGBAFormat:

				switch ( type ) {

					case UnsignedByteType:
						formatGPU = ( encoding === sRGBEncoding ) ? GPUTextureFormat.RGBA8UnormSRGB : GPUTextureFormat.RGBA8Unorm;
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

			default:
				console.error( 'WebGPURenderer: Unsupported texture format.', format );

		}

		return formatGPU;

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

		} else if ( needsMipmaps === true ) {

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

			width = ( image.length > 0 ) ? image[ 0 ].width : 1;
			height = ( image.length > 0 ) ? image[ 0 ].height : 1;
			depth = 6; // one image for each side of the cube map

		} else if ( image !== undefined ) {

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
