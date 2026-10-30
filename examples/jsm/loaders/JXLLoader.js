import {
	DataTexture,
	FileLoader,
	HalfFloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	Loader,
	RGBAFormat
} from 'three';

/**
 * Loads HDR JPEG XL images using the browser's native decoder.
 * Produces half-float textures in linear sRGB. Requires float16 Canvas2D,
 * the srgb-linear canvas color space and globalHDRHeadroom.
 *
 * ```js
 * const texture = await new JXLLoader().loadAsync( 'image.jxl' );
 * const material = new THREE.MeshStandardMaterial( { emissive: 0xffffff, emissiveMap: texture } );
 * ```
 *
 * @augments Loader
 * @three_import import { JXLLoader } from 'three/addons/loaders/JXLLoader.js';
 */
class JXLLoader extends Loader {

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
	 * @param {ArrayBuffer} buffer - JPEG XL bytes.
	 * @param {function(DataTexture)} onLoad - Completion callback.
	 * @param {Function} onError - Error callback.
	 */
	parse( buffer, onLoad, onError ) {

		this.parseAsync( buffer ).then( onLoad, onError );

	}

	/**
	 * Async version of {@link JXLLoader#parse}.
	 * @param {ArrayBuffer} buffer - JPEG XL bytes.
	 * @return {Promise<DataTexture>} Half-float texture in linear sRGB.
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
		const context = canvas.getContext( '2d', { colorSpace: 'srgb-linear', colorType: 'float16' } );

		if ( context.getContextAttributes().colorType !== 'float16' || ! ( 'globalHDRHeadroom' in context ) ) {

			throw new Error( 'JXLLoader: Canvas2D float16 storage and globalHDRHeadroom are required.' );

		}

		const url = URL.createObjectURL( new Blob( [ buffer ] ) );
		const image = new Image();

		try {

			image.src = url;
			await image.decode();

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			context.globalHDRHeadroom = Infinity;
			context.drawImage( image, 0, 0 );

			const pixels = context.getImageData( 0, 0, canvas.width, canvas.height, { colorSpace: 'srgb-linear', pixelFormat: 'rgba-float16' } );

			if ( pixels.pixelFormat !== 'rgba-float16' ) {

				throw new Error( 'JXLLoader: Canvas2D rgba-float16 readback is required.' );

			}

			// reinterpret the Float16Array readback as half-float bits
			const data = new Uint16Array( pixels.data.buffer, pixels.data.byteOffset, pixels.data.length );

			return { data, width: canvas.width, height: canvas.height };

		} finally {

			URL.revokeObjectURL( url );
			canvas.width = canvas.height = 0;

		}

	}

}

export { JXLLoader };
