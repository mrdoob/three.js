import { AnimationClip } from '../animation/AnimationClip';
import { XHRLoader } from './XHRLoader';
import { DefaultLoadingManager } from './LoadingManager';

/**
 * @author bhouston / http://clara.io/
 */

function AnimationLoader ( manager ) {
	this.isAnimationLoader = true;

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

Object.assign( AnimationLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new XHRLoader( scope.manager );
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

	}

} );


export { AnimationLoader };