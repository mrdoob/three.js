import { ShaderLib, ShaderMaterial, UniformsUtils } from '../../../build/three.module';

/**
 * @author Maxime Quiblier / http://github.com/maximeq
 *
 */
export function MeshWorldPositionMaterial( parameters ) {

	parameters = parameters || {};

	parameters.uniforms = UniformsUtils.merge( [
		ShaderLib.depth.uniforms
	] );
	parameters.vertexShader = [

		"#include <common>",
		"#include <displacementmap_pars_vertex>",
		"#include <fog_pars_vertex>",
		"#include <morphtarget_pars_vertex>",
		"#include <skinning_pars_vertex>",
		"#include <shadowmap_pars_vertex>",
		"#include <logdepthbuf_pars_vertex>",
		"#include <clipping_planes_pars_vertex>",

		"varying vec4 vWorldPosition;",

		"void main() {",

		"#include <skinbase_vertex>",

		"#include <begin_vertex>",
		"#include <morphtarget_vertex>",
		"#include <skinning_vertex>",
		"#include <displacementmap_vertex>",
		"#include <project_vertex>",
		"#include <logdepthbuf_vertex>",
		"#include <clipping_planes_vertex>",

		"vWorldPosition = modelMatrix * vec4( transformed, 1.0 );",

		"}"
	].join( "\n" );

	parameters.fragmentShader = [
		"varying vec4 vWorldPosition;",
		"void main() {",
		"gl_FragColor = vWorldPosition;",
		"}",
	].join( "\n" );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false;
	this.lights = false;

	this.skinning = false;
	this.morphTargets = false;

	this.isMeshDepthMaterial = true;
	this.isMeshWorldPositionMaterial = true;

	ShaderMaterial.call( this, parameters );

}

MeshWorldPositionMaterial.prototype = Object.create( ShaderMaterial.prototype );
MeshWorldPositionMaterial.prototype.constructor = MeshWorldPositionMaterial;
