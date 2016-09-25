import { Texture } from './Texture';
import { NearestFilter, UnsignedShortType, UnsignedInt248Type, DepthFormat, DepthStencilFormat } from '../constants';

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

	if ( this.format === DepthFormat ) {

		this.type = type !== undefined ? type : UnsignedShortType;

	} else {

		this.type = type !== undefined ? type : UnsignedInt248Type;

	}

	if ( this.format === DepthFormat ) {

		if ( this.type !== UnsignedShortType && this.type !== UnsignedIntType ) {

			console.warn( 'THREE.DepthTexture: DepthFormat requires UnsignedShortType or UnsignedIntType.' );

		}

	} else {

		if ( this.type !== UnsignedInt248Type ) {

			console.warn( 'THREE.DepthTexture: DepthStencilFormat requires UnsignedInt248Type.' );

		}

	}

	this.magFilter = magFilter !== undefined ? magFilter : NearestFilter;
	this.minFilter = minFilter !== undefined ? minFilter : NearestFilter;

	this.flipY = false;
	this.generateMipmaps	= false;

}

DepthTexture.prototype = Object.create( Texture.prototype );
DepthTexture.prototype.constructor = DepthTexture;
DepthTexture.prototype.isDepthTexture = true;

export { DepthTexture };
