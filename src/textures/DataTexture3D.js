/**
 * @author Artur Trzesiok
 */

import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

function DataTexture3D( data, width, height, depth ) {

	// We're going to add .setXXX() methods for setting properties later.
	// Users can still set in DataTexture3D directly.
	//
	//	var texture = new THREE.DataTexture3D( data, width, height, depth );
	// 	texture.anisotropy = 16;
	//
	// See #14839

	Texture.call( this, null );

	this.image = { data: data, width: width, height: height, depth: depth };

	this.magFilter = NearestFilter;
	this.minFilter = NearestFilter;

	this.wrapR = ClampToEdgeWrapping;

	this.generateMipmaps = false;
	this.flipY = false;

}

DataTexture3D.prototype = Object.create( Texture.prototype );
DataTexture3D.prototype.constructor = DataTexture3D;
DataTexture3D.prototype.isDataTexture3D = true;

export { DataTexture3D };
