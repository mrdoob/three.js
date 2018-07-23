/**
 * @author Artur Trzesiok
 */

import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

function Texture3D( data, width, height, length, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.image = { data: data, width: width, height: height, length: length };

	this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

	this.generateMipmaps = false;
	this.flipY = false;

}

Texture3D.prototype = Object.create( Texture.prototype );
Texture3D.prototype.constructor = Texture3D;
Texture3D.prototype.isTexture3D = true;

export { Texture3D };
