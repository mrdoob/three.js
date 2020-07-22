/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Texture } from './Texture.js';
import { EquirectangularReflectionMapping, RGBFormat } from '../constants.js';

function EquirectangularTexture( image ) {

	Texture.call( this, image );

	this.mapping = EquirectangularReflectionMapping; // TODO Remove Reflection/Refraction
	this.format = RGBFormat;

}

EquirectangularTexture.prototype = Object.create( Texture.prototype );
EquirectangularTexture.prototype.constructor = EquirectangularTexture;

EquirectangularTexture.prototype.isEquirectangularTexture = true;


export { EquirectangularTexture };
