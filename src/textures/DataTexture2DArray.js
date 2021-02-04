import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

function DataTexture2DArray( data = null, width = 1, height = 1, depth = 1 ) {

	Texture.call( this, null );

	this.image = { data, width, height, depth };

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
