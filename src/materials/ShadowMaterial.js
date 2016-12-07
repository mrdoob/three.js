import { ShaderMaterial } from './ShaderMaterial';
import { ShaderChunk } from '../renderers/shaders/ShaderChunk';
import { UniformsLib } from '../renderers/shaders/UniformsLib';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function ShadowMaterial() {

	ShaderMaterial.call( this, {
		uniforms: Object.assign( {},
			UniformsLib.lights
		),
		vertexShader: ShaderChunk[ 'shadow_vert' ],
		fragmentShader: ShaderChunk[ 'shadow_frag' ]
	} );

	this.lights = true;
	this.transparent = true;
	this.isExperimentalMaterial = true;

}

ShadowMaterial.prototype = Object.create( ShaderMaterial.prototype );
ShadowMaterial.prototype.constructor = ShadowMaterial;

ShadowMaterial.prototype.isShadowMaterial = true;


export { ShadowMaterial };
