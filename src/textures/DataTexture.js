import { Texture } from './Texture';
import { NearestFilter } from '../constants';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function DataTexture( data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.image = { data: data, width: width, height: height };

	this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

	this.flipY = false;
	this.generateMipmaps  = false;

}

DataTexture.prototype = Object.create( Texture.prototype );
DataTexture.prototype.constructor = DataTexture;

DataTexture.prototype.isDataTexture = true;


export { DataTexture };
