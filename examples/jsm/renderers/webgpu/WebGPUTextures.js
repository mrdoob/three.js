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

		let addressMode = 'clamp-to-edge';

		if ( value === RepeatWrapping ) {

			addressMode = 'repeat';

		} else if ( value === MirroredRepeatWrapping ) {

			addressMode = 'mirror-repeat';

		}

		return addressMode;

	}

	_convertFilterMode( value ) {

		let filterMode = 'linear';

		if ( value === NearestFilter || value === NearestMipmapNearestFilter || value === NearestMipmapLinearFilter ) {

			filterMode = 'nearest';

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
			format: "rgba8unorm",
			usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
		} );

		// convert HTML iamges and canvas elements to ImageBitmap before copy

		if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
			( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ) {

			createImageBitmap( image, 0, 0, width, height ).then( imageBitmap => {

				this._uploadTexture( imageBitmap, textureGPU );

			} );

		} else {

			if ( image !== undefined ) {

				// assuming ImageBitmap. Directly start operation of the contents of ImageBitmap into the destination texture

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
