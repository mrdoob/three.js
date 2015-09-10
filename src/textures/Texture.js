/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

module.exports = Texture;

var Constants = require( "../Constants" ),
	EventDispatcher = require( "../core/EventDispatcher" ),
	_Math = require( "../math/Math" ),
	Vector2 = require( "../math/Vector2" );

function Texture( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	Object.defineProperty( this, "id", { value: Texture.IdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = "";
	this.sourceFile = "";

	this.image = image !== undefined ? image : Texture.DEFAULT_IMAGE;
	this.mipmaps = [];

	this.mapping = mapping !== undefined ? mapping : Texture.DEFAULT_MAPPING;

	this.wrapS = wrapS !== undefined ? wrapS : Constants.ClampToEdgeWrapping;
	this.wrapT = wrapT !== undefined ? wrapT : Constants.ClampToEdgeWrapping;

	this.magFilter = magFilter !== undefined ? magFilter : Constants.LinearFilter;
	this.minFilter = minFilter !== undefined ? minFilter : Constants.LinearMipMapLinearFilter;

	this.anisotropy = anisotropy !== undefined ? anisotropy : 1;

	this.format = format !== undefined ? format : Constants.RGBAFormat;
	this.type = type !== undefined ? type : Constants.UnsignedByteType;

	this.offset = new Vector2( 0, 0 );
	this.repeat = new Vector2( 1, 1 );

	this.generateMipmaps = true;
	this.premultiplyAlpha = false;
	this.flipY = true;
	this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

	this.version = 0;
	this.onUpdate = null;

}

Texture.DEFAULT_IMAGE = undefined;
Texture.DEFAULT_MAPPING = Constants.UVMapping;

Texture.prototype = {

	constructor: Texture,

	get needsUpdate () {

		return undefined;

	},

	set needsUpdate ( value ) {

		if ( value === true ) { this.version ++; }

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( source ) {

		this.image = source.image;
		this.mipmaps = source.mipmaps.slice( 0 );

		this.mapping = source.mapping;

		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;

		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;

		this.anisotropy = source.anisotropy;

		this.format = source.format;
		this.type = source.type;

		this.offset.copy( source.offset );
		this.repeat.copy( source.repeat );

		this.generateMipmaps = source.generateMipmaps;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.flipY = source.flipY;
		this.unpackAlignment = source.unpackAlignment;

		return this;

	},

	toJSON: function ( meta ) {

		if ( meta.textures[ this.uuid ] !== undefined ) {

			return meta.textures[ this.uuid ];

		}

		function getDataURL( image ) {

			var canvas;

			if ( image.toDataURL !== undefined ) {

				canvas = image;

			} else {

				canvas = document.createElement( "canvas" );
				canvas.width = image.width;
				canvas.height = image.height;

				canvas.getContext( "2d" ).drawImage( image, 0, 0, image.width, image.height );

			}

			if ( canvas.width > 2048 || canvas.height > 2048 ) {

				return canvas.toDataURL( "image/jpeg", 0.6 );

			} else {

				return canvas.toDataURL( "image/png" );

			}

		}

		var output = {
			metadata: {
				version: 4.4,
				type: "Texture",
				generator: "Texture.toJSON"
			},

			uuid: this.uuid,
			name: this.name,

			mapping: this.mapping,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			wrap: [ this.wrapS, this.wrapT ],

			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy
		};

		if ( this.image !== undefined ) {

			// TODO: Move to Image

			var image = this.image;

			if ( image.uuid === undefined ) {

				image.uuid = _Math.generateUUID(); // UGH

			}

			if ( meta.images[ image.uuid ] === undefined ) {

				meta.images[ image.uuid ] = {
					uuid: image.uuid,
					url: getDataURL( image )
				};

			}

			output.image = image.uuid;

		}

		meta.textures[ this.uuid ] = output;

		return output;

	},

	dispose: function () {

		this.dispatchEvent( { type: "dispose" } );

	},

	transformUv: function ( uv ) {

		if ( this.mapping !== Constants.UVMapping ) { return; }

		uv.multiply( this.repeat );
		uv.add( this.offset );

		if ( uv.x < 0 || uv.x > 1 ) {

			switch ( this.wrapS ) {

				case Constants.RepeatWrapping:

					uv.x = uv.x - Math.floor( uv.x );
					break;

				case Constants.ClampToEdgeWrapping:

					uv.x = uv.x < 0 ? 0 : 1;
					break;

				case Constants.MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.x ) % 2 ) === 1 ) {

						uv.x = Math.ceil( uv.x ) - uv.x;

					} else {

						uv.x = uv.x - Math.floor( uv.x );

					}
					break;

			}

		}

		if ( uv.y < 0 || uv.y > 1 ) {

			switch ( this.wrapT ) {

				case Constants.RepeatWrapping:

					uv.y = uv.y - Math.floor( uv.y );
					break;

				case Constants.ClampToEdgeWrapping:

					uv.y = uv.y < 0 ? 0 : 1;
					break;

				case Constants.MirroredRepeatWrapping:

					if ( Math.abs( Math.floor( uv.y ) % 2 ) === 1 ) {

						uv.y = Math.ceil( uv.y ) - uv.y;

					} else {

						uv.y = uv.y - Math.floor( uv.y );

					}
					break;

			}

		}

		if ( this.flipY ) {

			uv.y = 1 - uv.y;

		}

	}

};

EventDispatcher.prototype.apply( Texture.prototype );

Texture.IdCount = 0;
