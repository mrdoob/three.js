/**
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */

THREE.AudioLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

Object.assign( THREE.AudioLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new THREE.XHRLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			var context = THREE.AudioContext;

			context.decodeAudioData( buffer, function ( audioBuffer ) {

				onLoad( audioBuffer );

			} );

		}, onProgress, onError );

	}

} );
