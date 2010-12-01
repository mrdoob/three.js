var ImageUtils = {

	loadTexture: function ( path, mapping ) {

		var texture = new THREE.Texture( null, mapping );

		var image = new Image();

		image.onload = function () {

			texture.image = this;
			texture.loaded = true;

		};

		image.src = path;

		return texture;

	},

	loadArray: function ( array ) {

		var i, l, images = [];

		images.loadCount = 0;

		for ( i = 0, l = array.length; i < l; ++i ) {

			images[ i ] = new Image();
			images[ i ].loaded = 0;
			images[ i ].onload = function () { images.loadCount += 1; this.loaded = 1; }
			images[ i ].src = array[ i ];

		}

		return images;

	}

}
