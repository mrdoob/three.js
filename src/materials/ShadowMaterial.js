import { ShaderMaterial } from './ShaderMaterial';
import { ShaderChunk } from '../renderers/shaders/ShaderChunk';
import { UniformsLib } from '../renderers/shaders/UniformsLib';
import { UniformsUtils } from '../renderers/shaders/UniformsUtils';

/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  color: <THREE.Color>,
 *  opacity: <float>
 * }
 */

function ShadowMaterial( parameters ) {

	ShaderMaterial.call( this, {
		uniforms: UniformsUtils.merge( [
			UniformsLib.lights,
			{
				color: { value: new THREE.Color( 0, 0, 0 ) },
				opacity: { value: 1.0 }
			}
		] ),
		vertexShader: ShaderChunk[ 'shadow_vert' ],
		fragmentShader: ShaderChunk[ 'shadow_frag' ]
	} );

	this.lights = true;
	this.transparent = true;

	Object.defineProperties( this, {
		color: {
			enumerable: true,
			get: function () {
				return this.uniforms.color.value;
			},
			set: function ( value ) {
				this.uniforms.color.value = value;
			}
		},
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

	this.setValues( parameters );

}

ShadowMaterial.prototype = Object.create( ShaderMaterial.prototype );
ShadowMaterial.prototype.constructor = ShadowMaterial;

ShadowMaterial.prototype.isShadowMaterial = true;


export { ShadowMaterial };
