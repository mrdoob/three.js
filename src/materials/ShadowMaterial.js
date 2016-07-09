import { ShaderMaterial } from './ShaderMaterial';
import { ShaderChunk } from '../renderers/shaders/ShaderChunk';
import { UniformsLib } from '../renderers/shaders/UniformsLib';
import { UniformsUtils } from '../renderers/shaders/UniformsUtils';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function ShadowMaterial () {
	this.isShadowMaterial = this.isShaderMaterial = this.isMaterial = true;

	ShaderMaterial.call( this, {
		uniforms: UniformsUtils.merge( [
			UniformsLib[ "lights" ],
			{
				opacity: { value: 1.0 }
			}
		] ),
		vertexShader: ShaderChunk[ 'shadow_vert' ],
		fragmentShader: ShaderChunk[ 'shadow_frag' ]
	} );

	this.lights = true;
	this.transparent = true;

	Object.defineProperties( this, {
		opacity: {
			enumerable: true,
			get: function () {
				return this.uniforms.opacity.value;
			},
			set: function ( value ) {
				this.uniforms.opacity.value = value;
			}
		}
	} );

};

ShadowMaterial.prototype = Object.create( ShaderMaterial.prototype );
ShadowMaterial.prototype.constructor = ShadowMaterial;


export { ShadowMaterial };