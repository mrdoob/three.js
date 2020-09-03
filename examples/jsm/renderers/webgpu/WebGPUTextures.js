import { GPUTextureFormat, GPUAddressMode, GPUFilterMode } from './constants.js';
import { Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, RepeatWrapping, MirroredRepeatWrapping } from '../../../../build/three.module.js';

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
					// are updated, a  call of _uploadTexture() should be sufficient. However, if the user changes
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

	_createTexture( texture ) {

		const device = this.device;
		const image = texture.image;

		const width = ( image !== undefined ) ? image.width : 1;
		const height = ( image !== undefined ) ? image.height : 1;

		const textureGPU = device.createTexture( {
			size: {
				width: width,
				height: height,
				depth: 1,
			},
			format: GPUTextureFormat.RGBA8Unorm,
			usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
		} );

		// convert HTML iamges and canvas elements to ImageBitmap before copy

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ) {

			const options = {};

			options.imageOrientation = ( texture.flipY === true ) ? 'flipY' : 'none';

			createImageBitmap( image, 0, 0, width, height, options ).then( imageBitmap => {

				this._uploadTexture( imageBitmap, textureGPU );

			} );

		} else {

			if ( image !== undefined ) {

				// assuming ImageBitmap. Directly start copy operation of the contents of ImageBitmap into the destination texture

				this._uploadTexture( image, textureGPU );

			}

		}

		return textureGPU;

	}

	_uploadTexture( imageBitmap, textureGPU ) {

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
