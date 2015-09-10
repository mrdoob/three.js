/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = DataTexture;

var Texture = require( "./Texture" ),
	Constants = require( "../Constants" );

function DataTexture( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.image = { data: data, width: width, height: height };

	this.magFilter = magFilter !== undefined ? magFilter : Constants.NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : Constants.NearestFilter;
	
	this.flipY = false;
	this.generateMipmaps  = false;

}

DataTexture.prototype = Object.create( Texture.prototype );
DataTexture.prototype.constructor = DataTexture;
