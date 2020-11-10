import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

function DataTexture( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.image = { data: data || null, width: width || 1, height: height || 1 };

	this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

	this.generateMipmaps = false;
	this.flipY = false;
	this.unpackAlignment = 1;

	this.needsUpdate = true;

}

DataTexture.prototype = Object.create( Texture.prototype );
DataTexture.prototype.constructor = DataTexture;

DataTexture.prototype.isDataTexture = true;


export { DataTexture };
