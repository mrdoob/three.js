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

		const scope = this;

		const loader = new FileLoader( scope.manager );
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

		const animations = [];

		for ( let i = 0; i < json.length; i ++ ) {

			const clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	}

} );


export { AnimationLoader };
