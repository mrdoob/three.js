import { AnimationClip } from '../animation/AnimationClip.js';
import { FileLoader } from './FileLoader.js';
import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author bhouston / http://clara.io/
 */

function AnimationLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( AnimationLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json, onLoad ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		onLoad( animations );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { AnimationLoader };
