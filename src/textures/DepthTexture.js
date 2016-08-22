import { Texture } from './Texture';
import { NearestFilter, UnsignedShortType, DepthFormat, DepthStencilFormat } from '../constants';

/**
 * @author Matt DesLauriers / @mattdesl
 * @author atix / arthursilber.de
 */

function DepthTexture( width, height, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, format ) {

	format = format !== undefined ? format : DepthFormat;

	if ( format !== DepthFormat && format !== DepthStencilFormat ) {

		throw new Error( 'DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat' )

	}

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.image = { width: width, height: height };

	this.type = type !== undefined ? type : UnsignedShortType;

	this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

	this.flipY = false;
	this.generateMipmaps	= false;

}

DepthTexture.prototype = Object.create( Texture.prototype );
DepthTexture.prototype.constructor = DepthTexture;
DepthTexture.prototype.isDepthTexture = true;

export { DepthTexture };
