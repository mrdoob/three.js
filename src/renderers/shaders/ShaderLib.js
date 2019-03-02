import { mergeUniforms } from './UniformsUtils.js';
import { Vector3 } from '../../math/Vector3.js';
import { UniformsLib } from './UniformsLib.js';
import { Color } from '../../math/Color.js';
import { Matrix3 } from '../../math/Matrix3.js';
import {
	meshbasic_vert,
	meshbasic_frag,
	meshlambert_vert,
	meshlambert_frag,
	meshphong_vert,
	meshphong_frag,
	meshphysical_vert,
	meshphysical_frag,
	meshmatcap_vert,
	meshmatcap_frag,
	points_vert,
	points_frag,
	linedashed_vert,
	linedashed_frag,
	depth_vert,
	depth_frag,
	normal_vert,
	normal_frag,
	sprite_vert,
	sprite_frag,
	background_vert,
	background_frag,
	cube_vert,
	cube_frag,
	equirect_vert,
	equirect_frag,
	distanceRGBA_vert,
	distanceRGBA_frag,
	shadow_vert,
	shadow_frag,
	meshphysical_vert,
	meshphysical_frag
} from './ShaderChunk.js';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

var ShaderLib = {

	basic: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.specularmap,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.fog
		] ),

		vertexShader: meshbasic_vert,
		fragmentShader: meshbasic_frag

	},

	lambert: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.specularmap,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.emissivemap,
			UniformsLib.fog,
			UniformsLib.lights,
			{
				emissive: { value: new Color( 0x000000 ) }
			}
		] ),

		vertexShader: meshlambert_vert,
		fragmentShader: meshlambert_frag

	},

	phong: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.specularmap,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.emissivemap,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			UniformsLib.gradientmap,
			UniformsLib.fog,
			UniformsLib.lights,
			{
				emissive: { value: new Color( 0x000000 ) },
				specular: { value: new Color( 0x111111 ) },
				shininess: { value: 30 }
			}
		] ),

		vertexShader: meshphong_vert,
		fragmentShader: meshphong_frag

	},

	standard: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.envmap,
			UniformsLib.aomap,
			UniformsLib.lightmap,
			UniformsLib.emissivemap,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			UniformsLib.roughnessmap,
			UniformsLib.metalnessmap,
			UniformsLib.fog,
			UniformsLib.lights,
			{
				emissive: { value: new Color( 0x000000 ) },
				roughness: { value: 0.5 },
				metalness: { value: 0.5 },
				envMapIntensity: { value: 1 } // temporary
			}
		] ),

		vertexShader: meshphysical_vert,
		fragmentShader: meshphysical_frag

	},

	matcap: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			UniformsLib.fog,
			{
				matcap: { value: null }
			}
		] ),

		vertexShader: meshmatcap_vert,
		fragmentShader: meshmatcap_frag

	},

	points: {

		uniforms: mergeUniforms( [
			UniformsLib.points,
			UniformsLib.fog
		] ),

		vertexShader: points_vert,
		fragmentShader: points_frag

	},

	dashed: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.fog,
			{
				scale: { value: 1 },
				dashSize: { value: 1 },
				totalSize: { value: 2 }
			}
		] ),

		vertexShader: linedashed_vert,
		fragmentShader: linedashed_frag

	},

	depth: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.displacementmap
		] ),

		vertexShader: depth_vert,
		fragmentShader: depth_frag

	},

	normal: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.bumpmap,
			UniformsLib.normalmap,
			UniformsLib.displacementmap,
			{
				opacity: { value: 1.0 }
			}
		] ),

		vertexShader: normal_vert,
		fragmentShader: normal_frag

	},

	sprite: {

		uniforms: mergeUniforms( [
			UniformsLib.sprite,
			UniformsLib.fog
		] ),

		vertexShader: sprite_vert,
		fragmentShader: sprite_frag

	},

	background: {

		uniforms: {
			uvTransform: { value: new Matrix3() },
			t2D: { value: null },
		},

		vertexShader: background_vert,
		fragmentShader: background_frag

	},
	/* -------------------------------------------------------------------------
	//	Cube map shader
	 ------------------------------------------------------------------------- */

	cube: {

		uniforms: {
			tCube: { value: null },
			tFlip: { value: - 1 },
			opacity: { value: 1.0 }
		},

		vertexShader: cube_vert,
		fragmentShader: cube_frag

	},

	equirect: {

		uniforms: {
			tEquirect: { value: null },
		},

		vertexShader: equirect_vert,
		fragmentShader: equirect_frag

	},

	distanceRGBA: {

		uniforms: mergeUniforms( [
			UniformsLib.common,
			UniformsLib.displacementmap,
			{
				referencePosition: { value: new Vector3() },
				nearDistance: { value: 1 },
				farDistance: { value: 1000 }
			}
		] ),

		vertexShader: distanceRGBA_vert,
		fragmentShader: distanceRGBA_frag

	},

	shadow: {

		uniforms: mergeUniforms( [
			UniformsLib.lights,
			UniformsLib.fog,
			{
				color: { value: new Color( 0x00000 ) },
				opacity: { value: 1.0 }
			},
		] ),

		vertexShader: shadow_vert,
		fragmentShader: shadow_frag

	}

};

ShaderLib.physical = {

	uniforms: mergeUniforms( [
		ShaderLib.standard.uniforms,
		{
			clearCoat: { value: 0 },
			clearCoatRoughness: { value: 0 }
		}
	] ),

	vertexShader: meshphysical_vert,
	fragmentShader: meshphysical_frag

};


export { ShaderLib };
