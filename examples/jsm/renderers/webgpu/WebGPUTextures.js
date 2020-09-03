import { GPUTextureFormat, GPUAddressMode, GPUFilterMode } from './constants.js';
import { Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, RepeatWrapping, MirroredRepeatWrapping, FloatType, HalfFloatType } from '../../../../build/three.module.js';

class WebGPUTextures {

	constructor( device, properties ) {

		this.device = device;
		this.properties = properties;

		this.textures = new WeakMap();

		this.defaultTexture = null;
		this.defaultSampler = null;

		this.samplerCache = new WeakMap();

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

		return textureProperties.sampler;

	}

	updateTexture( texture ) {

		let updated = false;

		const textureProperties = this.properties.get( texture );

		if ( texture.version > 0 && textureProperties.version !== texture.version ) {

			const image = texture.image;

			if ( image === undefined ) {

				console.warn( 'THREE.WebGPURenderer: Texture marked for update but image is undefined' );

			} else if ( image.complete === false ) {

				console.warn( 'THREE.WebGPURenderer: Texture marked for update but image is incomplete' );

			} else {

				if ( textureProperties.textureGPU !== undefined ) {

					// TODO: Avoid calling of destroy() in certain scenarios. When only the contents of a texture
					// are updated, a buffer upload should be sufficient. However, if the user changes
					// the dimensions of the texture, format or usage, a new instance of GPUTexture is required.

					textureProperties.textureGPU.destroy();

				}

				textureProperties.textureGPU = this._createTexture( texture );
				textureProperties.version = texture.version;
				updated = true;

			}

		}

		return updated;

	}

	updateSampler( texture ) {

		let updated = false;

		const array = [];

		array.push( texture.wrapS );
		array.push( texture.wrapT );
		array.push( texture.wrapR );
		array.push( texture.magFilter );
		array.push( texture.minFilter );
		array.push( texture.anisotropy );

		const newKey = array.join();
		const key = this.samplerCache.get( texture );

		if ( key !== newKey ) {

			this.samplerCache.set( texture, newKey );

			const sampler = this.device.createSampler( {
				addressModeU: this._convertAddressMode( texture.wrapS ),
				addressModeV: this._convertAddressMode( texture.wrapT ),
				addressModeW: this._convertAddressMode( texture.wrapR ),
				magFilter: this._convertFilterMode( texture.magFilter ),
				minFilter: this._convertFilterMode( texture.minFilter ),
				mipmapFilter: this._convertFilterMode( texture.minFilter ),
				maxAnisotropy: texture.anisotropy
			} );

			const textureProperties = this.properties.get( texture );
			textureProperties.sampler = sampler;

			updated = true;

		}

		return updated;


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

		const textureGPU = device.createTexture( {
			size: {
				width: width,
				height: height,
				depth: 1,
			},
			format: format,
			usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
		} );

		if ( texture.isDataTexture ) {

			this.__copyBufferToTexture( image, format, textureGPU );

		} else {

			// convert HTML iamges and canvas elements to ImageBitmap before copy

			if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
				( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ) {

				const options = {};

				options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';

				createImageBitmap( image, 0, 0, width, height, options ).then( imageBitmap => {

					this._copyImageBitmapToTexture( imageBitmap, textureGPU );

				} );

			} else {

				if ( image !== undefined ) {

					// assuming ImageBitmap. Directly start copy operation of the contents of ImageBitmap into the destination texture

					this._copyImageBitmapToTexture( image, textureGPU );

				}

			}

		}

		return textureGPU;

	}

	__copyBufferToTexture( image, format, textureGPU ) {

		// this code assumes data textures in RGBA format
		// TODO: Consider to support valid buffer layouts with other formats like RGB

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

	_getBytesPerTexel( format ) {

		if ( format === GPUTextureFormat.RGBA8Unorm ) return 4;
		if ( format === GPUTextureFormat.RGBA16Float ) return 8;
		if ( format === GPUTextureFormat.RGBA32Float ) return 16;

	}

	_copyImageBitmapToTexture( imageBitmap, textureGPU ) {

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

	}

}

export default WebGPUTextures;
