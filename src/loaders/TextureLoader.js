/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.TextureLoader = function ( crossOrigin ) {

	this.crossOrigin = crossOrigin;

};

THREE.TextureLoader.prototype = {

	constructor: THREE.TextureLoader,

	load: function ( url, onLoad ) {

		var texture = new THREE.Texture();

		var loader = new THREE.ImageLoader();
		loader.crossOrigin = this.crossOrigin;
		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		} );

		return texture;

	}

};
