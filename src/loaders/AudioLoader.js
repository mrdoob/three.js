import { AudioContext } from '../audio/AudioContext.js';
import { Cache } from './Cache.js';
import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

function AudioLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( AudioLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		var scope = this;

		var cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		fetch( url ).then( function ( response ) {

			return response.arrayBuffer();

		} ).then( function ( arrayBuffer ) {

			var context = AudioContext.getContext();

			context.decodeAudioData( arrayBuffer, function ( audioBuffer ) {

				Cache.add( url, audioBuffer );

				if ( onLoad ) onLoad( audioBuffer );

				scope.manager.itemEnd( url );

			} );

		} ).catch( function ( error ) {

			if ( onError ) onError( error );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		} );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { AudioLoader };
