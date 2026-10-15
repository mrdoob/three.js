import {
	DataTexture,
	DataUtils,
	FileLoader,
	HalfFloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	Loader,
	RGBAFormat
} from 'three';

/**
 * Loads HDR AVIF and JPEG XL images using the browser's native decoder.
 * Produces linear sRGB half-float textures. Requires float16 Canvas2D and
 * globalHDRHeadroom.
 *
 * ```js
 * const texture = await new NativeHDRLoader().loadAsync( 'image.avif' );
 * const material = new THREE.MeshStandardMaterial( { emissive: 0xffffff, emissiveMap: texture } );
 * ```
 *
 * @augments Loader
 * @three_import import { NativeHDRLoader } from 'three/addons/loaders/NativeHDRLoader.js';
 */
class NativeHDRLoader extends Loader {

	/**
	 * Loads a native HDR image into a half-float data texture.
	 * @param {string} url - Image URL.
	 * @param {function(DataTexture)} onLoad - Completion callback.
	 * @param {Function} onProgress - Download progress callback.
	 * @param {Function} onError - Error callback.
	 * @return {DataTexture} Placeholder texture, populated after decoding.
	 */
	load( url, onLoad, onProgress, onError ) {

		const texture = new DataTexture( null, 0, 0, RGBAFormat, HalfFloatType );
		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.setResponseType( 'arraybuffer' );

		// Track decoding so the manager does not finish after the download.
		this.manager.itemStart( url );

		const onFailure = error => {

			if ( onError ) onError( error );
			else console.error( error );

			this.manager.itemError( url );
			this.manager.itemEnd( url );

		};

		loader.load( url, buffer => {

			this._decode( buffer ).then( data => {

				this._applyData( texture, data );
				if ( onLoad ) onLoad( texture );
				this.manager.itemEnd( url );

			}, onFailure );

		}, onProgress, onFailure );

		return texture;

	}

	/**
	 * Decodes image bytes using the browser, preserving maximum HDR headroom.
	 * @param {ArrayBuffer} buffer - AVIF or JPEG XL bytes.
	 * @param {function(DataTexture)} onLoad - Completion callback.
	 * @param {Function} onError - Error callback.
	 */
	parse( buffer, onLoad, onError ) {

		this.parseAsync( buffer ).then( onLoad, onError );

	}

	/**
	 * Async version of {@link NativeHDRLoader#parse}.
	 * @param {ArrayBuffer} buffer - AVIF or JPEG XL bytes.
	 * @return {Promise<DataTexture>} Linear sRGB half-float texture.
	 */
	async parseAsync( buffer ) {

		const data = await this._decode( buffer );
		const texture = new DataTexture();
		this._applyData( texture, data );
		return texture;

	}

	_applyData( texture, { data, width, height } ) {

		texture.image = { data, width, height };
		texture.format = RGBAFormat;
		texture.type = HalfFloatType;
		texture.colorSpace = LinearSRGBColorSpace;
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.flipY = true;
		texture.needsUpdate = true;

	}

	async _decode( buffer ) {

		const canvas = document.createElement( 'canvas' );
		let context;
		try {

			context = canvas.getContext( '2d', { colorSpace: 'srgb', colorType: 'float16' } );

		} catch ( cause ) {

			throw new Error( 'NativeHDRLoader: 16-bit float Canvas2D creation failed.', { cause } );

		}

		if ( ! context ) {

			throw new Error( 'NativeHDRLoader: Canvas2D is unavailable.' );

		}

		if ( context.getContextAttributes?.().colorType !== 'float16' ) {

			throw new Error( 'NativeHDRLoader: 16-bit float canvas storage unsupported.' );

		}

		if ( ! ( 'globalHDRHeadroom' in context ) ) {

			throw new Error( 'NativeHDRLoader: globalHDRHeadroom unsupported.' );

		}

		const url = URL.createObjectURL( new Blob( [ buffer ] ) );
		const image = new Image();

		try {

			image.src = url;
			try {

				await image.decode();

			} catch ( cause ) {

				throw new Error( 'NativeHDRLoader: Native image decoding failed.', { cause } );

			}

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			try {

				context.globalHDRHeadroom = Infinity;
				if ( context.globalHDRHeadroom !== Infinity ) throw new Error( 'HDR headroom setting was not retained.' );
				context.drawImage( image, 0, 0 );

			} catch ( cause ) {

				throw new Error( 'NativeHDRLoader: globalHDRHeadroom not available.', { cause } );

			}

			let pixels;
			try {

				pixels = context.getImageData( 0, 0, canvas.width, canvas.height, {
					colorSpace: 'srgb', pixelFormat: 'rgba-float16'
				} );

			} catch ( cause ) {

				throw new Error( 'NativeHDRLoader: 16-bit float pixel readback failed.', { cause } );

			}

			if ( pixels.pixelFormat !== 'rgba-float16' ) {

				throw new Error( 'NativeHDRLoader: 16-bit float pixel readback is unavailable.' );

			}

			const data = new Uint16Array( pixels.data.length );

			for ( let i = 0; i < data.length; i ++ ) {

				let value = pixels.data[ i ];
				if ( i % 4 !== 3 ) {

					// Extended sRGB inverse transfer, including negative wide-gamut values.
					const magnitude = Math.abs( value );
					value = Math.sign( value ) * ( magnitude <= 0.04045 ? magnitude / 12.92 : Math.pow( ( magnitude + 0.055 ) / 1.055, 2.4 ) );

				}

				data[ i ] = DataUtils.toHalfFloat( value );

			}

			return { data, width: canvas.width, height: canvas.height };

		} finally {

			URL.revokeObjectURL( url );
			canvas.width = canvas.height = 0;

		}

	}

}

export { NativeHDRLoader };
