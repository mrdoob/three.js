/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ImageUtils = {

	loadTexture: function ( path, mapping, callback ) {

		var image = new Image(),
			texture = new THREE.Texture( image, mapping );

		image.onload = function () { texture.needsUpdate = true; if ( callback ) callback( this ); };
		image.src = path;

		return texture;

	},

	loadTextureCube: function ( array, mapping, callback ) {

		var i, l, 
			images = [],
			texture = new THREE.Texture( images, mapping );

		images.loadCount = 0;

		for ( i = 0, l = array.length; i < l; ++i ) {

			images[ i ] = new Image();
			images[ i ].onload = function () {

				images.loadCount += 1; 
				if ( images.loadCount == 6 ) texture.needsUpdate = true; 
				if ( callback ) callback( this );

			};

			images[ i ].src = array[ i ];

		}

		return texture;

	}

};
