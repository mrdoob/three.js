/**
 * @author bhouston / http://exocortex.com/
 */

THREE.DefaultImageLoader = function () {

	//this.ensurePowerOf2 = false;

};

THREE.DefaultImageLoader.prototype = {

 	loadTexture: function ( url, mapping, onLoad, onError ) {

		return THREE.ImageUtils.loadTexture( url, mapping, onLoad, onError );

	},

	loadCompressedTexture: function ( url, mapping, onLoad, onError ) {

		return THREE.ImageUtils.loadCompressedTexture( url, mapping, onLoad, onError );

	},

	loadTextureCube: function ( array, mapping, onLoad, onError ) {

		return THREE.ImageUtils.loadTextureCube( array, mapping, onLoad, onError );

	},

	loadCompressedTextureCube: function ( array, mapping, onLoad, onError ) {

		return THREE.ImageUtils.loadCompressedTextureCube( array, mapping, onLoad, onError );

	},

	generateDataTexture: function ( width, height, color ) {

		return THREE.ImageUtils.generateDataTexture( width, height, color );
	}

};