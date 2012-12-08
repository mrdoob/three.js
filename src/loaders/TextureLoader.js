/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.TextureLoader = function () {

	THREE.EventTarget.call( this );

	this.crossOrigin = null;

};

THREE.TextureLoader.prototype = {

	constructor: THREE.TextureLoader,

	load: function ( url ) {

		var scope = this;

		var image = new Image();

		image.addEventListener( 'load', function () {

			var texture = new THREE.Texture( image );
			texture.needsUpdate = true;

			scope.dispatchEvent( { type: 'load', content: texture } );

		}, false );

		image.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		if ( scope.crossOrigin ) image.crossOrigin = scope.crossOrigin;

		image.src = url;

	}

}
