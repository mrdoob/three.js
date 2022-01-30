import {
	CubeTexture,
	DataTexture,
	FileLoader,
	FloatType,
	HalfFloatType,
	LinearEncoding,
	LinearFilter,
	Loader
} from 'three';
import { RGBELoader } from '../loaders/RGBELoader.js';

class HDRCubeTextureLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.hdrLoader = new RGBELoader();
		this.type = HalfFloatType;

	}

	load( urls, onLoad, onProgress, onError ) {

		if ( ! Array.isArray( urls ) ) {

			console.warn( 'THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead.' );

			this.setDataType( urls );

			urls = onLoad;
			onLoad = onProgress;
			onProgress = onError;
			onError = arguments[ 4 ];

		}

		const texture = new CubeTexture();

		texture.type = this.type;

		switch ( texture.type ) {

			case FloatType:

				texture.encoding = LinearEncoding;
				texture.minFilter = LinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				break;

			case HalfFloatType:

				texture.encoding = LinearEncoding;
				texture.minFilter = LinearFilter;
				texture.magFilter = LinearFilter;
				texture.generateMipmaps = false;
				break;

		}

		const scope = this;

		let loaded = 0;

		function loadHDRData( i, onLoad, onProgress, onError ) {

			new FileLoader( scope.manager )
				.setPath( scope.path )
				.setResponseType( 'arraybuffer' )
				.setWithCredentials( scope.withCredentials )
				.load( urls[ i ], function ( buffer ) {

					loaded ++;

					const texData = scope.hdrLoader.parse( buffer );

					if ( ! texData ) return;

					if ( texData.data !== undefined ) {

						const dataTexture = new DataTexture( texData.data, texData.width, texData.height );

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

		for ( let i = 0; i < urls.length; i ++ ) {

			loadHDRData( i, onLoad, onProgress, onError );

		}

		return texture;

	}

	setDataType( value ) {

		this.type = value;
		this.hdrLoader.setDataType( value );

		return this;

	}

}

export { HDRCubeTextureLoader };
