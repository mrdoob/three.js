import { ImageLoader } from './ImageLoader.js';
import { CubeTexture } from '../textures/CubeTexture.js';
import { Loader } from './Loader.js';
import { SRGBColorSpace } from '../constants.js';

/**
 * Class for loading cube textures. Images are internally loaded via {@link ImageLoader}.
 *
 * The loader returns an instance of {@link CubeTexture} and expects the cube map to
 * be defined as six separate images representing the sides of a cube. Other cube map definitions
 * like vertical and horizontal cross, column and row layouts are not supported.
 *
 * Note that, by convention, cube maps are specified in a coordinate system
 * in which positive-x is to the right when looking up the positive-z axis --
 * in other words, using a left-handed coordinate system. Since three.js uses
 * a right-handed coordinate system, environment maps used in three.js will
 * have pos-x and neg-x swapped.
 *
 * The loaded cube texture is in sRGB color space. Meaning {@link Texture#colorSpace}
 * is set to `SRGBColorSpace` by default.
 *
 * ```js
 * const loader = new THREE.CubeTextureLoader().setPath( 'textures/cubeMaps/' );
 * const cubeTexture = await loader.loadAsync( [
 * 	'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'
 * ] );
 * scene.background = cubeTexture;
 * ```
 *
 * @augments Loader
 */
class CubeTextureLoader extends Loader {

	/**
	 * Constructs a new cube texture loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and pass the fully loaded cube texture
	 * to the `onLoad()` callback. The method also returns a new cube texture object which can
	 * directly be used for material creation. If you do it this way, the cube texture
	 * may pop up in your scene once the respective loading process is finished.
	 *
	 * @param {Array<string>} urls - Array of 6 URLs to images, one for each side of the
	 * cube texture. The urls should be specified in the following order: pos-x,
	 * neg-x, pos-y, neg-y, pos-z, neg-z. An array of data URIs are allowed as well.
	 * @param {function(CubeTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Unsupported in this loader.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {CubeTexture} The cube texture.
	 */
	load( urls, onLoad, onProgress, onError ) {

		const texture = new CubeTexture();
		texture.colorSpace = SRGBColorSpace;

		const loader = new ImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		let loaded = 0;

		function loadTexture( i ) {

			loader.load( urls[ i ], function ( image ) {

				texture.images[ i ] = image;

				loaded ++;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}

			}, undefined, onError );

		}

		for ( let i = 0; i < urls.length; ++ i ) {

			loadTexture( i );

		}

		return texture;

	}

}


export { CubeTextureLoader };
