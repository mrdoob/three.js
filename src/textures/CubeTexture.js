/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = CubeTexture;

var Texture = require( "./Texture" ),
	Constants = require( "../Constants" );

function CubeTexture( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	mapping = mapping !== undefined ? mapping : Constants.CubeReflectionMapping;

	Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.images = images;
	this.flipY = false;

}

CubeTexture.prototype = Object.create( Texture.prototype );
CubeTexture.prototype.constructor = CubeTexture;

CubeTexture.prototype.copy = function ( source ) {

	Texture.prototype.copy.call( this, source );
	
	this.images = source.images;
	
	return this;

};
