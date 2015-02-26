/**
* @author mrdoob / http://mrdoob.com/
*/

THREE.WebGLTextures = function ( gl ) {

	var textures = {};

	this.get = function ( texture ) {

		if ( textures[ texture.id ] !== undefined ) {

			return textures[ texture.id ];

		}

		return this.create( texture );

	};

	this.create = function ( texture ) {

		texture.addEventListener( 'dispose', this.delete );

		textures[ texture.id ] = gl.createTexture();

		return textures[ texture.id ];

	};

	this.delete = function ( texture ) {

		texture.removeEventListener( 'dispose', this.delete );

		gl.deleteTexture( textures[ texture.id ] );

		delete textures[ texture.id ];

	};

};
