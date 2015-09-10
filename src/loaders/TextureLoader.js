/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = TextureLoader;

var DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager,
	ImageLoader = require( "./ImageLoader" ),
	Texture = require( "../textures/Texture" );

function TextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

TextureLoader.prototype = {

	constructor: TextureLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new ImageLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( image ) {

			var texture = new Texture( image );
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
