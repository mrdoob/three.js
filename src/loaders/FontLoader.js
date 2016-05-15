/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.FontLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.FontLoader.prototype = {

	constructor: THREE.FontLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( this.manager );
		loader.load( url, function ( text ) {

			var fontDataMarker = 'loadFace('
			var fontDataStart = text.indexOf(fontDataMarker)

			var fontData = text

			if (fontDataStart === -1) {
				// no marker found, treat as pure json
			
				fontData = text
			
			}
			else {
				// marker found, strip javascript wrapper out
			
				fontData = text.substring( fontDataStart + fontDataMarker.length, text.length - 2 )
			
			}

			var font = scope.parse( JSON.parse(fontData) );

			if ( onLoad ) onLoad( font );

		}, onProgress, onError );

	},

	parse: function ( json ) {

		return new THREE.Font( json );

	}

};
