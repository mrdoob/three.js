import {
	FileLoader,
	Loader,
	LoaderUtils,
	Scene,
	TextureLoader
} from 'three';

import { TGALoader } from '../loaders/TGALoader.js';
import { ColladaParser } from './collada/ColladaParser.js';
import { ColladaComposer } from './collada/ColladaComposer.js';

/**
 * A loader for the Collada format.
 *
 * The Collada format is very complex so this loader only supports a subset of what
 * is defined in the [official specification](https://www.khronos.org/files/collada_spec_1_5.pdf).
 *
 * Assets with a Z-UP coordinate system are transformed it into Y-UP by a simple rotation.
 * The vertex data are not converted.
 *
 * ```js
 * const loader = new ColladaLoader();
 *
 * const result = await loader.loadAsync( './models/collada/elf/elf.dae' );
 * scene.add( result.scene );
 * ```
 *
 * @augments Loader
 * @three_import import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
 */
class ColladaLoader extends Loader {

	/**
	 * Starts loading from the given URL and passes the loaded Collada asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function({scene:Group,animations:Array<AnimationClip>,kinematics:Object})} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given Collada data and returns a result object holding the parsed scene,
	 * an array of animation clips and kinematics.
	 *
	 * @param {string} text - The raw Collada data as a string.
	 * @param {string} [path] - The asset path.
	 * @return {?{scene:Group,animations:Array<AnimationClip>,kinematics:Object}} An object representing the parsed asset.
	 */
	parse( text, path ) {

		if ( text.length === 0 ) {

			return { scene: new Scene() };

		}

		// Parse XML to library data
		const parser = new ColladaParser();
		const parseResult = parser.parse( text );

		if ( parseResult === null ) {

			return null;

		}

		const { library, asset, collada } = parseResult;

		// Setup texture loaders
		const textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		let tgaLoader;

		if ( TGALoader ) {

			tgaLoader = new TGALoader( this.manager );
			tgaLoader.setPath( this.resourcePath || path );

		}

		// Compose Three.js objects from library data
		const composer = new ColladaComposer( library, collada, textureLoader, tgaLoader );
		const { scene, animations, kinematics } = composer.compose();

		scene.animations = animations;

		// Handle coordinate system conversion
		if ( asset.upAxis === 'Z_UP' ) {

			console.warn( 'THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289.' );
			scene.rotation.set( - Math.PI / 2, 0, 0 );

		}

		// Apply unit scale
		scene.scale.multiplyScalar( asset.unit );

		return {
			get animations() {

				console.warn( 'THREE.ColladaLoader: Please access animations over scene.animations now.' );
				return animations;

			},
			kinematics: kinematics,
			library: library,
			scene: scene
		};

	}

}

export { ColladaLoader };
