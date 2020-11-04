import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

function DataTexture2DArray( data, width, height, depth ) {

	Texture.call( this, null );

	this.image = { data: data || null, width: width || 1, height: height || 1, depth: depth || 1 };

	this.magFilter = NearestFilter;
	this.minFilter = NearestFilter;

	this.wrapR = ClampToEdgeWrapping;

	this.generateMipmaps = false;
	this.flipY = false;

	this.needsUpdate = true;

}

DataTexture2DArray.prototype = Object.create( Texture.prototype );
DataTexture2DArray.prototype.constructor = DataTexture2DArray;
DataTexture2DArray.prototype.isDataTexture2DArray = true;

export { DataTexture2DArray };
