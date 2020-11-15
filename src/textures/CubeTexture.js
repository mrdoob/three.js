import { Texture } from './Texture.js';
import { CubeReflectionMapping, RGBFormat } from '../constants.js';

function CubeTexture( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding ) {

	images = images !== undefined ? images : [];
	mapping = mapping !== undefined ? mapping : CubeReflectionMapping;
	format = format !== undefined ? format : RGBFormat;

	Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

	this.flipY = false;

	// Why CubeTexture._needsFlipEnvMap is necessary:
	//
	// By convention -- likely based on the RenderMan spec from the 1990's -- cube maps are specified by WebGL (and three.js)
	// in a coordinate system in which positive-x is to the right when looking up the positive-z axis -- in other words,
	// in a left-handed coordinate system. By continuing this convention, preexisting cube maps continued to render correctly.

	// three.js uses a right-handed coordinate system. So environment maps used in three.js appear to have px and nx swapped
	// and the flag _needsFlipEnvMap controls this conversion. The flip is not required (and thus _needsFlipEnvMap is set to false)
	// when using WebGLCubeRenderTarget.texture as a cube texture.

	this._needsFlipEnvMap = true;

}

CubeTexture.prototype = Object.create( Texture.prototype );
CubeTexture.prototype.constructor = CubeTexture;

CubeTexture.prototype.isCubeTexture = true;

Object.defineProperty( CubeTexture.prototype, 'images', {

	get: function () {

		return this.image;

	},

	set: function ( value ) {

		this.image = value;

	}

} );


export { CubeTexture };
