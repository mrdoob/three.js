/**
 * @author Takahiro https://github.com/takahirox
 */

import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

function DataTexture2DArray( data, width, height, depth ) {

	Texture.call( this, null );

	this.image = { data: data, width: width, height: height, depth: depth };

	this.magFilter = NearestFilter;
	this.minFilter = NearestFilter;

	this.wrapR = ClampToEdgeWrapping;

	this.generateMipmaps = false;
	this.flipY = false;

}

DataTexture2DArray.prototype = Object.create( Texture.prototype );
DataTexture2DArray.prototype.constructor = DataTexture2DArray;
DataTexture2DArray.prototype.isDataTexture2DArray = true;

export { DataTexture2DArray };
