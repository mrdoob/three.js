import { Texture } from './Texture';
import { NearestFilter, UnsignedShortType, DepthFormat } from '../constants';

/**
 * @author Matt DesLauriers / @mattdesl
 */

function DepthTexture ( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {
	this.isDepthTexture = this.isTexture = true;

  Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, DepthFormat, type, anisotropy );

  this.image = { width: width, height: height };

  this.type = type !== undefined ? type : UnsignedShortType;

  this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
  this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

  this.flipY = false;
  this.generateMipmaps  = false;

};

DepthTexture.prototype = Object.create( Texture.prototype );
DepthTexture.prototype.constructor = DepthTexture;


export { DepthTexture };