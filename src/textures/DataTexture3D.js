import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

function DataTexture3D( data = null, width = 1, height = 1, depth = 1 ) {

	// We're going to add .setXXX() methods for setting properties later.
	// Users can still set in DataTexture3D directly.
	//
	//	const texture = new THREE.DataTexture3D( data, width, height, depth );
	// 	texture.anisotropy = 16;
	//
	// See #14839

	Texture.call( this, null );

	this.image = { data, width, height, depth };

	this.magFilter = NearestFilter;
	this.minFilter = NearestFilter;

	this.wrapR = ClampToEdgeWrapping;

	this.generateMipmaps = false;
	this.flipY = false;

	this.needsUpdate = true;


}

DataTexture3D.prototype = Object.create( Texture.prototype );
DataTexture3D.prototype.constructor = DataTexture3D;
DataTexture3D.prototype.isDataTexture3D = true;

export { DataTexture3D };
