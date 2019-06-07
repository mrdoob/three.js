/**
* @author Prashant Sharma / spidersharma03
* @author Ben Houston / http://clara.io / bhouston
*/

import {
	CubeTexture,
	DataTexture,
	DefaultLoadingManager,
	FileLoader,
	FloatType,
	HalfFloatType,
	LinearEncoding,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGBEEncoding,
	RGBFormat,
	UnsignedByteType
} from "../../../build/three.module.js";
import { RGBELoader } from "../loaders/RGBELoader.js";

var HDRCubeTextureLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.hdrLoader = new RGBELoader();
	this.type = UnsignedByteType;

};

HDRCubeTextureLoader.prototype.load = function ( urls, onLoad, onProgress, onError ) {

	if ( ! Array.isArray( urls ) ) {

		console.warn( 'THREE.HDRCubeTextureLoader signature has changed. Use .setType() instead.' );

		this.setType( urls );

		urls = onLoad;
		onLoad = onProgress;
		onProgress = onError;
		onError = arguments[ 4 ];

	}

	var texture = new CubeTexture();

	texture.type = this.type;

	switch ( texture.type ) {

		case UnsignedByteType:

			texture.encoding = RGBEEncoding;
			texture.format = RGBAFormat;
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;
			texture.generateMipmaps = false;
			break;

		case FloatType:

			texture.encoding = LinearEncoding;
			texture.format = RGBFormat;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.generateMipmaps = false;
			break;

		case HalfFloatType:

			texture.encoding = LinearEncoding;
			texture.format = RGBFormat;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.generateMipmaps = false;
			break;

	}

	var scope = this;

	var loaded = 0;

	function loadHDRData( i, onLoad, onProgress, onError ) {

		new FileLoader( scope.manager )
			.setPath( scope.path )
			.setResponseType( 'arraybuffer' )
			.load( urls[ i ], function ( buffer ) {

				loaded ++;

				var texData = scope.hdrLoader._parser( buffer );

				if ( ! texData ) return;

				if ( texData.data !== undefined ) {

					var dataTexture = new DataTexture( texData.data, texData.width, texData.height );

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

};

HDRCubeTextureLoader.prototype.setPath = function ( value ) {

	this.path = value;
	return this;

};

HDRCubeTextureLoader.prototype.setType = function ( value ) {

	this.type = value;
	this.hdrLoader.setType( value );
	return this;

};

export { HDRCubeTextureLoader };
