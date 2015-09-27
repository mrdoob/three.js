/**
 * @author mrdoob / http://mrdoob.com/
 * @author zz85 / http://joshuakoo.com/
 */

THREE.SVGLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.SVGLoader.prototype = {

	constructor: THREE.SVGLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var parser = new DOMParser();

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( svgString ) {

			var doc = parser.parseFromString( svgString, 'image/svg+xml' );  // application/xml

			onLoad( doc.documentElement );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
