var ImageUtils = {

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
