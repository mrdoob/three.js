import { AnimationClip } from '../animation/AnimationClip.js';
import { FileLoader } from './FileLoader.js';
import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author bhouston / http://clara.io/
 */

class AnimationLoader {

	constructor( manager ) {

		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	}

	load( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	}

	parse( json, onLoad ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		onLoad( animations );

	}

}


export { AnimationLoader };
