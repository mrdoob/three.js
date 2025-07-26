import {
	FileLoader,
	Loader,
	CanvasTexture,
	NearestFilter,
	SRGBColorSpace
} from 'three';

import lottie from '../libs/lottie_canvas.module.js';

/**
 * A loader for the Lottie texture animation format.
 *
 * The loader returns an instance of {@link CanvasTexture} to represent
 * the animated texture. Two additional properties are added to each texture:
 * - `animation`: The return value of `lottie.loadAnimation()` which is an object
 * with an API for controlling the animation's playback.
 * - `image`: The image container.
 *
 * ```js
 * const loader = new LottieLoader();
 * loader.setQuality( 2 );
 * const texture = await loader.loadAsync( 'textures/lottie/24017-lottie-logo-animation.json' );
 *
 * const geometry = new THREE.BoxGeometry();
 * const material = new THREE.MeshBasicMaterial( { map: texture } );
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments Loader
 * @three_import import { LottieLoader } from 'three/addons/loaders/LottieLoader.js';
 */
class LottieLoader extends Loader {

	/**
	 * Constructs a new Lottie loader.
	 *
	 * @deprecated The loader has been deprecated and will be removed with r186. Use lottie-web instead and create your animated texture manually.
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		console.warn( 'THREE.LottieLoader: The loader has been deprecated and will be removed with r186. Use lottie-web instead and create your animated texture manually.' );

	}

	/**
	 * Sets the texture quality.
	 *
	 * @param {number} value - The texture quality.
	 */
	setQuality( value ) {

		this._quality = value;

	}

	/**
	 * Starts loading from the given URL and passes the loaded Lottie asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(CanvasTexture)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @returns {CanvasTexture} The Lottie texture.
	 */
	load( url, onLoad, onProgress, onError ) {

		const quality = this._quality || 1;

		const texture = new CanvasTexture();
		texture.minFilter = NearestFilter;
		texture.generateMipmaps = false;
		texture.colorSpace = SRGBColorSpace;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setWithCredentials( this.withCredentials );

		loader.load( url, function ( text ) {

			const data = JSON.parse( text );

			// lottie uses container.offsetWidth and offsetHeight
			// to define width/height

			const container = document.createElement( 'div' );
			container.style.width = data.w + 'px';
			container.style.height = data.h + 'px';
			document.body.appendChild( container );

			const animation = lottie.loadAnimation( {
				container: container,
				animType: 'canvas',
				loop: true,
				autoplay: true,
				animationData: data,
				rendererSettings: { dpr: quality }
			} );

			texture.animation = animation;
			texture.image = animation.container;

			animation.addEventListener( 'enterFrame', function () {

				texture.needsUpdate = true;

			} );

			container.style.display = 'none';

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

}

export { LottieLoader };
