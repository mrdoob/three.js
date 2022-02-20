import { ShaderLib, ShaderMaterial, UniformsUtils } from "../../../build/three.module";

/**
 * @author Maxime Quiblier / http://github.com/maximeq
 */
export function MeshViewPositionMaterial( parameters ) {

	parameters = parameters || {};

	parameters.coordinate = parameters.coordinate || 'x';

	parameters.uniforms = UniformsUtils.merge( [
		ShaderLib.displacementmap
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

		"varying vec3 vViewPosition;",

		"void main() {",

		"#include <skinbase_vertex>",

		"#include <begin_vertex>",
		"#include <morphtarget_vertex>",
		"#include <skinning_vertex>",
		"#include <displacementmap_vertex>",
		"#include <project_vertex>",
		"#include <logdepthbuf_vertex>",
		"#include <clipping_planes_vertex>",

		"vViewPosition = gl_Position",

		"}"
	].join( "\n" );

	parameters.fragmentShader = [
		"#include <packing>",
		// packDepthToRGBA can only pack [0,1[ with 1.0 exluded
		"#define packUnitFloat32ToRGBA packDepthToRGBA", // alias for better understanding
		"varying vec3 vViewPosition;",
		"void main() {",
		parameters.useFloatTexture ?
			"gl_FragColor = vViewPosition;" : "gl_FragColor = packUnitFloat32ToRGBA((vViewPosition." + parameters.coordinate + " + 1.0) / 4.0);",
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

	ShaderMaterial.call( this, parameters );

}

MeshViewPositionMaterial.prototype = Object.create( ShaderMaterial.prototype );
MeshViewPositionMaterial.prototype.constructor = MeshViewPositionMaterial;
