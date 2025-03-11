import {
	Loader,
	TextureLoader,
	Data3DTexture,
	RGBAFormat,
	UnsignedByteType,
	ClampToEdgeWrapping,
	LinearFilter,
} from 'three';

/**
 * A loader for loading LUT images.
 *
 * ```js
 * const loader = new LUTImageLoader();
 * const map = loader.loadAsync( 'luts/NeutralLUT.png' );
 * ```
 *
 * @augments Loader
 */
export class LUTImageLoader extends Loader {

	/**
	 * Constructs a new LUT loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Whether to vertically flip the LUT or not.
		 *
		 * Depending on the LUT's origin, the texture has green at the bottom (e.g. for Unreal)
		 * or green at the top (e.g. for Unity URP Color Lookup). If you're using lut image strips
		 * from a Unity pipeline, then set this property to `true`.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.flip = false;

	}

	/**
	 * Starts loading from the given URL and passes the loaded LUT
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function({size:number,texture3D:Data3DTexture})} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const loader = new TextureLoader( this.manager );

		loader.setCrossOrigin( this.crossOrigin );

		loader.setPath( this.path );
		loader.load( url, texture => {

			try {

				let imageData;

				if ( texture.image.width < texture.image.height ) {

					imageData = this._getImageData( texture );

				} else {

					imageData = this._horz2Vert( texture );

				}

				onLoad( this.parse( imageData.data, Math.min( texture.image.width, texture.image.height ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				this.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given LUT data and returns the resulting 3D data texture.
	 *
	 * @param {Uint8ClampedArray} dataArray - The raw LUT data.
	 * @param {number} size - The LUT size.
	 * @return {{size:number,texture3D:Data3DTexture}} An object representing the parsed LUT.
	 */
	parse( dataArray, size ) {

		const data = new Uint8Array( dataArray );

		const texture3D = new Data3DTexture();
		texture3D.image.data = data;
		texture3D.image.width = size;
		texture3D.image.height = size;
		texture3D.image.depth = size;
		texture3D.format = RGBAFormat;
		texture3D.type = UnsignedByteType;
		texture3D.magFilter = LinearFilter;
		texture3D.minFilter = LinearFilter;
		texture3D.wrapS = ClampToEdgeWrapping;
		texture3D.wrapT = ClampToEdgeWrapping;
		texture3D.wrapR = ClampToEdgeWrapping;
		texture3D.generateMipmaps = false;
		texture3D.needsUpdate = true;

		return {
			size,
			texture3D,
		};

	}

	// internal

	_getImageData( texture ) {

		const width = texture.image.width;
		const height = texture.image.height;

		const canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext( '2d' );

		if ( this.flip === true ) {

			context.scale( 1, - 1 );
			context.translate( 0, - height );

		}

		context.drawImage( texture.image, 0, 0 );

		return context.getImageData( 0, 0, width, height );

	}

	_horz2Vert( texture ) {

		const width = texture.image.height;
		const height = texture.image.width;

		const canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext( '2d' );

		if ( this.flip === true ) {

			context.scale( 1, - 1 );
			context.translate( 0, - height );

		}

		for ( let i = 0; i < width; i ++ ) {

			const sy = i * width;
			const dy = ( this.flip ) ? height - i * width : i * width;
			context.drawImage( texture.image, sy, 0, width, width, 0, dy, width, width );

		}

		return context.getImageData( 0, 0, width, height );

	}

}
