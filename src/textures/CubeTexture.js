import { Texture } from './Texture';
import { CubeReflectionMapping } from '../constants';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function CubeTexture ( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding ) {
	this.isCubeTexture = this.isTexture = true;

	images = images !== undefined ? images : [];
	mapping = mapping !== undefined ? mapping : CubeReflectionMapping;

	Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.flipY = false;

};

CubeTexture.prototype = Object.create( Texture.prototype );
CubeTexture.prototype.constructor = CubeTexture;

Object.defineProperty( CubeTexture.prototype, 'images', {

	get: function () {

		return this.image;

	},

	set: function ( value ) {

		this.image = value;

	}

} );


export { CubeTexture };