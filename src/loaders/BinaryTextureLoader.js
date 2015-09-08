/**
 * @author Nikos M. / https://github.com/foo123/
 *
 * Abstract Base class to load generic binary textures formats (rgbe, hdr, ...)
 */

module.exports = BinaryTextureLoader;

var DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager,
	XHRLoader = require( "./XHRLoader" ),
	Constants = require( "../Constants" ),
	DataTexture = require( "../textures/DataTexture" );

function BinaryTextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	// override in sub classes
	this._parser = null;

}

BinaryTextureLoader.prototype = {

	constructor: BinaryTextureLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var texture = new DataTexture();

		var loader = new XHRLoader( this.manager );

		loader.setCrossOrigin( this.crossOrigin );
		loader.setResponseType( "arraybuffer" );

		loader.load( url, function ( buffer ) {

			var texData = scope._parser( buffer );

			if ( ! texData ) { return; }

			if ( undefined !== texData.image ) {

				texture.image = texData.image;

			} else if ( undefined !== texData.data ) {

				texture.image.width = texData.width;
				texture.image.height = texData.height;
				texture.image.data = texData.data;

			}

			texture.wrapS = undefined !== texData.wrapS ? texData.wrapS : Constants.ClampToEdgeWrapping;
			texture.wrapT = undefined !== texData.wrapT ? texData.wrapT : Constants.ClampToEdgeWrapping;

			texture.magFilter = undefined !== texData.magFilter ? texData.magFilter : Constants.LinearFilter;
			texture.minFilter = undefined !== texData.minFilter ? texData.minFilter : Constants.LinearMipMapLinearFilter;

			texture.anisotropy = undefined !== texData.anisotropy ? texData.anisotropy : 1;

			if ( undefined !== texData.format ) {

				texture.format = texData.format;

			}
			if ( undefined !== texData.type ) {

				texture.type = texData.type;

			}

			if ( undefined !== texData.mipmaps ) {

				texture.mipmaps = texData.mipmaps;

			}

			if ( 1 === texData.mipmapCount ) {

				texture.minFilter = Constants.LinearFilter;

			}

			texture.needsUpdate = true;

			if ( onLoad ) { onLoad( texture, texData ); }

		}, onProgress, onError );


		return texture;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
