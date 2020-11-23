import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

function DataTexture( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, encoding ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.image = { data, width, height };

	this.generateMipmaps = false;
	this.flipY = false;
	this.unpackAlignment = 1;

	this.needsUpdate = true;

}

DataTexture.prototype = Object.create( Texture.prototype );
DataTexture.prototype.constructor = DataTexture;

DataTexture.prototype.isDataTexture = true;


export { DataTexture };
