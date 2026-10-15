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
 * Experimental native AVIF/JPEG XL HDR decoder. Requires float16 Canvas2D and
 * globalHDRHeadroom. Unsupported browsers fail rather than silently return SDR.
 * Output is linear sRGB, relative to the browser's reference white, not physical
 * radiance. This loader does not define a glTF extension or parse HDR metadata.
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
	 * Constructs a native HDR loader.
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );
		this._requests = new Set();

	}

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

		// Keep LoadingManager pending during asynchronous browser decoding as well.
		const decodeURL = this.path + url + '#native-hdr-decode';
		this.manager.itemStart( decodeURL );
		let finished = false;
		const signal = this.manager.abortController.signal;
		const request = { abort: () => {

			try {

				fail( new DOMException( 'Loading aborted.', 'AbortError' ), false );

			} finally {

				loader.abort();

			}

		} };
		const end = () => {

			finished = true;
			this._requests.delete( request );
			signal.removeEventListener( 'abort', request.abort );
			this.manager.itemEnd( decodeURL );

		};

		const fail = ( error, notify = true ) => {

			if ( finished ) return;

			try {

				if ( onError ) onError( error );
				else console.error( error );

			} finally {

				try {

					if ( notify ) this.manager.itemError( decodeURL );

				} finally {

					end();

				}

			}

		};

		this._requests.add( request );
		signal.addEventListener( 'abort', request.abort, { once: true } );

		try {

			loader.load( url, ( buffer ) => {

				if ( finished ) return;
				this._decode( buffer ).then( ( data ) => {

					if ( finished ) return;
					this._applyData( texture, data );
					try {

						if ( onLoad ) onLoad( texture );

					} finally {

						end();

					}

				}, fail );

			}, onProgress, error => fail( error, false ) );

		} catch ( error ) {

			fail( error );

		}

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

	/**
	 * Aborts pending loads. Native decode may finish internally; late results are ignored.
	 * @return {NativeHDRLoader} This loader.
	 */
	abort() {

		let error;
		for ( const request of this._requests ) {

			try {

				request.abort();

			} catch ( cause ) {

				error = cause;

			}

		}

		if ( error ) throw error;
		return this;

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

		if ( typeof document === 'undefined' ) {

			throw new Error( 'NativeHDRLoader: native HDR decoding requires a document.' );

		}

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

		const missing = [];
		if ( context.getContextAttributes?.().colorType !== 'float16' ) missing.push( '16-bit float canvas storage' );
		if ( ! ( 'globalHDRHeadroom' in context ) ) missing.push( 'HDR headroom control (globalHDRHeadroom)' );
		if ( missing.length > 0 ) {

			throw new Error( 'NativeHDRLoader: Unavailable: ' + missing.join( '; ' ) + '.' );

		}

		const url = URL.createObjectURL( new Blob( [ buffer ] ) );
		const image = new Image();

		try {

			image.src = url;
			try {

				await image.decode();

			} catch ( cause ) {

				throw new Error( 'NativeHDRLoader: Native image decoding failed (unsupported codec or invalid image).', { cause } );

			}

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			try {

				context.globalHDRHeadroom = Infinity;
				if ( context.globalHDRHeadroom !== Infinity ) throw new Error( 'HDR headroom setting was not retained.' );
				context.drawImage( image, 0, 0 );

			} catch ( cause ) {

				throw new Error( 'NativeHDRLoader: HDR headroom / image-to-canvas conversion failed.', { cause } );

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
				if ( ! Number.isFinite( value ) ) {

					throw new Error( 'NativeHDRLoader: Linear half-float conversion failed: non-finite HDR pixels.' );

				}

				if ( i % 4 !== 3 ) {

					// Extended sRGB inverse transfer, including negative wide-gamut values.
					const magnitude = Math.abs( value );
					value = Math.sign( value ) * ( magnitude <= 0.04045 ? magnitude / 12.92 : Math.pow( ( magnitude + 0.055 ) / 1.055, 2.4 ) );

				}

				if ( Math.abs( value ) > 65504 ) {

					throw new Error( 'NativeHDRLoader: Linear half-float conversion failed: pixel exceeds the half-float range.' );

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
