/**
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */

THREE.AudioLoader = function( context, manager ) {

	this.context = ( context !== undefined ) ? context : new ( window.AudioContext || window.webkitAudioContext )();

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.AudioLoader.prototype = {

	constructor: THREE.AudioLoader,

	load: function( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function( buffer ) {

			scope.context.decodeAudioData( buffer, function( audioBuffer ) {

				onLoad( audioBuffer );

			} );

		}, onProgress, onError );

	}

};
