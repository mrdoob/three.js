/**
 * @author Artur Trzesiok
 */

import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

function Texture3D( data, width, height, depth ) {

	// We're going to add .setXXX() methods for setting properties later.
	// Users can still set in Texture3D directly.
	//
	//	var texture = new THREE.Texture3D( data, width, height, depth );
	// 	texture.anisotropy = 16;
	//
	// See #14839

	Texture.call( this, null );

	this.image = { data: data, width: width, height: height, depth: depth };

	this.magFilter = NearestFilter;
	this.minFilter = NearestFilter;

	this.generateMipmaps = false;
	this.flipY = false;

}

Texture3D.prototype = Object.create( Texture.prototype );
Texture3D.prototype.constructor = Texture3D;
Texture3D.prototype.isTexture3D = true;

export { Texture3D };
