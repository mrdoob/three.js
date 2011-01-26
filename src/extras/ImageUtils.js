var ImageUtils = {

	loadTexture: function ( path, mapping, callback ) {

		var image = new Image();
		image.onload = function () { this.loaded = true; if( callback ) callback( this ); };
		image.src = path;

		return new THREE.Texture( image, mapping );

	},

	loadArray: function ( array, callback ) {

		var i, l, images = [];

		images.loadCount = 0;

		for ( i = 0, l = array.length; i < l; ++i ) {

			images[ i ] = new Image();
			images[ i ].loaded = 0;
			images[ i ].onload = function () { images.loadCount += 1; this.loaded = true; if( callback ) callback( this ); };
			images[ i ].src = array[ i ];

		}

		return images;

	}

};
