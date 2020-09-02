import { Texture, NearestFilter, NearestMipmapNearestFilter, NearestMipmapLinearFilter, RepeatWrapping, MirroredRepeatWrapping } from '../../../../build/three.module.js';

class WebGPUTextures {

	constructor( device, properties ) {

		this.device = device;
		this.properties = properties;

		this.textures = new WeakMap();

		this.defaultTexture = null;
		this.defaultSampler = null;
		this.canvas = null;

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

			this.defaultTexture = this._createTexture( new Texture( new Image( 1, 1 ) ) );

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

		if ( this.canvas === null ) this.canvas = new OffscreenCanvas( 1, 1 );

		const width = image.width;
		const height = image.height;

		this.canvas.width = width;
		this.canvas.height = height;

		const context = this.canvas.getContext( '2d' );
		context.translate( 0, height );
		context.scale( 1, - 1 );
		context.drawImage( image, 0, 0, width, height );
		const imageData = context.getImageData( 0, 0, width, height );

		let data = null;

		const bytesPerRow = Math.ceil( width * 4 / 256 ) * 256;

		if ( bytesPerRow === width * 4 ) {

			data = imageData.data;

		} else {

			// ensure 4 byte alignment

			data = new Uint8Array( bytesPerRow * height );
			let imagePixelIndex = 0;

			for ( let y = 0; y < height; ++ y ) {

				for ( let x = 0; x < width; ++ x ) {

					const i = x * 4 + y * bytesPerRow;
					data[ i ] = imageData.data[ imagePixelIndex ];
					data[ i + 1 ] = imageData.data[ imagePixelIndex + 1 ];
					data[ i + 2 ] = imageData.data[ imagePixelIndex + 2 ];
					data[ i + 3 ] = imageData.data[ imagePixelIndex + 3 ];
					imagePixelIndex += 4;

				}

			}

		}

		const textureGPU = device.createTexture( {
			size: {
				width: image.width,
				height: image.height,
				depth: 1,
			},
			format: "rgba8unorm",
			usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
		} );

		const buffer = device.createBuffer( {
			size: data.byteLength,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
			mappedAtCreation: true,
		} );

		new Uint8Array( buffer.getMappedRange() ).set( data );

		buffer.unmap();

		const commandEncoder = device.createCommandEncoder( {} );

		commandEncoder.copyBufferToTexture(
			{
				buffer: buffer, bytesPerRow: bytesPerRow,
			}, {
				texture: textureGPU,
			}, {
				width: image.width,
				height: image.height,
				depth: 1,
			} );
		device.defaultQueue.submit( [ commandEncoder.finish() ] );
		buffer.destroy();

		return textureGPU;

	}

}

export default WebGPUTextures;
