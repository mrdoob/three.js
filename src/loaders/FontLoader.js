/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.FontLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.FontLoader.prototype = {

	constructor: THREE.FontLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new THREE.XHRLoader( this.manager );
		loader.load( url, function ( text ) {

			onLoad( new THREE.Font( JSON.parse( text.substring( 65, text.length - 2 ) ) ) );

		}, onProgress, onError );

	}

};
