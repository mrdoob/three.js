THREE.HDRCubeTextureLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

	this.hdrLoader = new THREE.RGBELoader();
	this.type = THREE.UnsignedByteType;

};

THREE.HDRCubeTextureLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.HDRCubeTextureLoader,

	load: function ( urls, onLoad, onProgress, onError ) {

		if ( ! Array.isArray( urls ) ) {

			console.warn( 'THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead.' );

			this.setDataType( urls );

			urls = onLoad;
			onLoad = onProgress;
			onProgress = onError;
			onError = arguments[ 4 ];

		}

		var texture = new THREE.CubeTexture();

		texture.type = this.type;

		switch ( texture.type ) {

			case THREE.UnsignedByteType:

				texture.encoding = THREE.RGBEEncoding;
				texture.format = THREE.RGBAFormat;
				texture.minFilter = THREE.NearestFilter;
				texture.magFilter = THREE.NearestFilter;
				texture.generateMipmaps = false;
				break;

			case THREE.FloatType:

				texture.encoding = THREE.LinearEncoding;
				texture.format = THREE.RGBFormat;
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.generateMipmaps = false;
				break;

			case THREE.HalfFloatType:

				texture.encoding = THREE.LinearEncoding;
				texture.format = THREE.RGBFormat;
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.generateMipmaps = false;
				break;

		}

		var scope = this;

		var loaded = 0;

		function loadHDRData( i, onLoad, onProgress, onError ) {

			new THREE.FileLoader( scope.manager )
				.setPath( scope.path )
				.setResponseType( 'arraybuffer' )
				.setWithCredentials( scope.withCredentials )
				.load( urls[ i ], function ( buffer ) {

					loaded ++;

					var texData = scope.hdrLoader.parse( buffer );

					if ( ! texData ) return;

					if ( texData.data !== undefined ) {

						var dataTexture = new THREE.DataTexture( texData.data, texData.width, texData.height );

						dataTexture.type = texture.type;
						dataTexture.encoding = texture.encoding;
						dataTexture.format = texture.format;
						dataTexture.minFilter = texture.minFilter;
						dataTexture.magFilter = texture.magFilter;
						dataTexture.generateMipmaps = texture.generateMipmaps;

						texture.images[ i ] = dataTexture;

					}

					if ( loaded === 6 ) {

						texture.needsUpdate = true;
						if ( onLoad ) onLoad( texture );

					}

				}, onProgress, onError );

		}

		for ( var i = 0; i < urls.length; i ++ ) {

			loadHDRData( i, onLoad, onProgress, onError );

		}

		return texture;

	},

	setDataType: function ( value ) {

		this.type = value;
		this.hdrLoader.setDataType( value );

		return this;

	}

} );
