import {
	CubeTexture,
	DataTexture,
	FileLoader,
	FloatType,
	HalfFloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	Loader
} from 'three';
import { RGBELoader } from '../loaders/RGBELoader.js';

/**
 * A loader for loading HDR cube textures.
 *
 * ```js
 * const loader = new HDRCubeTextureLoader();
 * loader.setPath( 'textures/cube/pisaHDR/' );
 * const cubeTexture = await loader.loadAsync( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ] );
 *
 * scene.background = cubeTexture;
 * scene.environment = cubeTexture;
 * ```
 *
 * @augments Loader
 * @three_import import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
 */
class HDRCubeTextureLoader extends Loader {

	/**
	 * Constructs a new HDR cube texture loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * The internal HDR loader that loads the
		 * individual textures for each cube face.
		 *
		 * @type {RGBELoader}
		 */
		this.hdrLoader = new RGBELoader();

		/**
		 * The texture type.
		 *
		 * @type {(HalfFloatType|FloatType)}
		 * @default HalfFloatType
		 */
		this.type = HalfFloatType;

	}

	/**
	 * Starts loading from the given URLs and passes the loaded HDR cube texture
	 * to the `onLoad()` callback.
	 *
	 * @param {Array<string>} urls - The paths/URLs of the files to be loaded. This can also be a data URIs.
	 * @param {function(CubeTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {CubeTexture} The HDR cube texture.
	 */
	load( urls, onLoad, onProgress, onError ) {

		const texture = new CubeTexture();

		texture.type = this.type;

		switch ( texture.type ) {

			case FloatType:

				texture.colorSpace = LinearSRGBColorSpace;
				texture.minFilter = LinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				break;

			case HalfFloatType:

				texture.colorSpace = LinearSRGBColorSpace;
				texture.minFilter = LinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				break;

		}

		const scope = this;

		let loaded = 0;

		function loadHDRData( i, onLoad, onProgress, onError ) {

			new FileLoader( scope.manager )
				.setPath( scope.path )
				.setResponseType( 'arraybuffer' )
				.setWithCredentials( scope.withCredentials )
				.load( urls[ i ], function ( buffer ) {

					loaded ++;

					const texData = scope.hdrLoader.parse( buffer );

					if ( ! texData ) return;

					if ( texData.data !== undefined ) {

						const dataTexture = new DataTexture( texData.data, texData.width, texData.height );

						dataTexture.type = texture.type;
						dataTexture.colorSpace = texture.colorSpace;
						dataTexture.format = texture.format;
						dataTexture.minFilter = texture.minFilter;
						dataTexture.magFilter = texture.magFilter;
						dataTexture.generateMipmaps = texture.generateMipmaps;

						texture.images[ i ] = dataTexture;

					}

					if ( loaded === 6 ) {

						texture.needsUpdate = true;
						if ( onLoad ) onLoad( texture );

					}

				}, onProgress, onError );

		}

		for ( let i = 0; i < urls.length; i ++ ) {

			loadHDRData( i, onLoad, onProgress, onError );

		}

		return texture;

	}

	/**
	 * Sets the texture type.
	 *
	 * @param {(HalfFloatType|FloatType)} value - The texture type to set.
	 * @return {RGBELoader} A reference to this loader.
	 */
	setDataType( value ) {

		this.type = value;
		this.hdrLoader.setDataType( value );

		return this;

	}

}

export { HDRCubeTextureLoader };
