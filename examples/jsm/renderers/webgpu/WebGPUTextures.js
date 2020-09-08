import { GPUTextureFormat, GPUAddressMode, GPUFilterMode } from './constants.js';
import { Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, LinearFilter, RepeatWrapping, MirroredRepeatWrapping, FloatType, HalfFloatType } from '../../../../build/three.module.js';
import WebGPUTextureUtils from './WebGPUTextureUtils.js';

class WebGPUTextures {

	constructor( device, properties, info, glslang ) {

		this.device = device;
		this.properties = properties;
		this.info = info;
		this.glslang = glslang;

		this.defaultTexture = null;
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

			this.defaultTexture = this._createTexture( new Texture() );

		}

		return this.defaultTexture;

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

			const colorTextureGPU = device.createTexture( {
				size: {
					width: width,
					height: height,
					depth: 1
				},
				format: GPUTextureFormat.BRGA8Unorm, // @TODO: Make configurable
				usage: GPUTextureUsage.OUTPUT_ATTACHMENT | GPUTextureUsage.SAMPLED
			} );

			renderTargetProperties.colorTextureGPU = colorTextureGPU;

			// When the ".texture" or ".depthTexture" property of a render target is used as a map,
			// the renderer has to find the respective GPUTexture objects to setup the bind groups.
			// Since it's not possible to see just from a texture object whether it belongs to a render
			// target or not, we need the initializedRTT flag.

			const textureProperties = properties.get( renderTarget.texture );
			textureProperties.textureGPU = colorTextureGPU;
			textureProperties.initializedRTT = false;

			if ( renderTarget.depthBuffer === true ) {

				const depthTextureGPU = device.createTexture( {
					size: {
						width: width,
						height: height,
						depth: 1
					},
					format: GPUTextureFormat.Depth24PlusStencil8, // @TODO: Make configurable
					usage: GPUTextureUsage.OUTPUT_ATTACHMENT
				} );

				renderTargetProperties.depthTextureGPU = depthTextureGPU;

				if ( renderTarget.depthTexture !== null ) {

					const depthTextureProperties = properties.get( renderTarget.depthTexture );
					depthTextureProperties.textureGPU = depthTextureGPU;
					depthTextureProperties.initializedRTT = false;

				}

			}

			renderTargetProperties.initialized = true;

		}

	}

	dispose() {

		this.samplerCache.clear();

	}

	_computeMipLevelCount( width, height ) {

		return Math.floor( Math.log2( Math.max( width, height ) ) ) + 1;

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

	_convertFormat( type ) {

		let formatGPU = GPUTextureFormat.RGBA8Unorm;

		if ( type === FloatType ) {

			formatGPU = GPUTextureFormat.RGBA32Float;

		} else if ( type === HalfFloatType ) {

			formatGPU = GPUTextureFormat.RGBA16Float;

		}

		return formatGPU;

	}

	_createTexture( texture ) {

		const device = this.device;
		const image = texture.image;

		const width = ( image !== undefined ) ? image.width : 1;
		const height = ( image !== undefined ) ? image.height : 1;

		const format = this._convertFormat( texture.type );
		const needsMipmaps = this._needsMipmaps( texture );
		const mipLevelCount = ( needsMipmaps === true ) ? this._computeMipLevelCount( width, height ) : undefined;

		let usage = GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST;

		if ( needsMipmaps === true ) {

			usage |= GPUTextureUsage.OUTPUT_ATTACHMENT;

		}

		// texture creation

		const textureGPUDescriptor = {
			size: {
				width: width,
				height: height,
				depth: 1,
			},
			format: format,
			usage: usage,
			mipLevelCount: mipLevelCount
		};
		const textureGPU = device.createTexture( textureGPUDescriptor );

		// transfer texture data

		if ( texture.isDataTexture ) {

			this._copyBufferToTexture( image, format, textureGPU );

		} else {

			// convert HTML iamges and canvas elements to ImageBitmap before copy

			if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
				( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ) {

				const options = {};

				options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';
				options.premultiplyAlpha = ( texture.premultiplyAlpha === true ) ? 'premultiply' : 'default';

				createImageBitmap( image, 0, 0, width, height, options ).then( imageBitmap => {

					this._copyImageBitmapToTexture( imageBitmap, textureGPU, needsMipmaps, textureGPUDescriptor );

				} );

			} else {

				if ( image !== undefined ) {

					// assuming ImageBitmap. Directly start copy operation of the contents of ImageBitmap into the destination texture

					this._copyImageBitmapToTexture( image, textureGPU, needsMipmaps, textureGPUDescriptor );

				}

			}

		}

		return textureGPU;

	}

	_copyBufferToTexture( image, format, textureGPU ) {

		// this code assumes data textures in RGBA format

		// @TODO: Consider to support valid buffer layouts with other formats like RGB
		// @TODO: Support mipmaps

		const device = this.device;
		const data = image.data;

		const bytesPerTexel = this._getBytesPerTexel( format );
		const bytesPerRow = Math.ceil( image.width * bytesPerTexel / 256 ) * 256;

		const textureDataBuffer = device.createBuffer( {
			size: data.byteLength,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
			mappedAtCreation: true,
		} );

		new data.constructor( textureDataBuffer.getMappedRange() ).set( data );
		textureDataBuffer.unmap();

		const commandEncoder = device.createCommandEncoder( {} );
		commandEncoder.copyBufferToTexture(
			{
				buffer: textureDataBuffer,
				bytesPerRow: bytesPerRow
			}, {
				texture: textureGPU
			}, {
				width: image.width,
				height: image.height,
				depth: 1
			} );

		device.defaultQueue.submit( [ commandEncoder.finish() ] );
		textureDataBuffer.destroy();

	}

	_copyImageBitmapToTexture( imageBitmap, textureGPU, needsMipmaps, textureGPUDescriptor ) {

		const device = this.device;

		device.defaultQueue.copyImageBitmapToTexture(
			{
				imageBitmap: imageBitmap
			}, {
				texture: textureGPU
			}, {
				width: imageBitmap.width,
				height: imageBitmap.height,
				depth: 1
			}
		);

		if ( needsMipmaps === true ) {

			if ( this.utils === null ) {

				this.utils = new WebGPUTextureUtils( this.device, this.glslang ); // only create this helper if necessary

			}

			this.utils.generateMipmappedTexture( imageBitmap, textureGPU, textureGPUDescriptor );

		}

	}

	_getBytesPerTexel( format ) {

		if ( format === GPUTextureFormat.RGBA8Unorm ) return 4;
		if ( format === GPUTextureFormat.RGBA16Float ) return 8;
		if ( format === GPUTextureFormat.RGBA32Float ) return 16;

	}

	_needsMipmaps( texture ) {

		return ( texture.generateMipmaps === true ) && ( texture.minFilter !== NearestFilter ) && ( texture.minFilter !== LinearFilter );

	}

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
