import { AnimationClip } from '../animation/AnimationClip.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';

/**
 * @author bhouston / http://clara.io/
 */

function AnimationLoader( manager ) {

	Loader.call( this, manager );

}

AnimationLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: AnimationLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	parse: function ( json ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	}

} );


export { AnimationLoader };
