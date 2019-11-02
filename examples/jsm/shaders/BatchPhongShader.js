/**
 * @author Min.H
 *
 * just for MeshPhongMaterial
 *
 * add batchMap,use map color decide the diffuse color, it cost more memory to cut draw call number.
 */

import {
	ShaderChunk,
	ShaderLib,
	UniformsUtils
} from "../../../build/three.module.js";

var BatchPhongShader = {

	uniforms: UniformsUtils.merge([

		ShaderLib.phong.uniforms,

		{
			batchMap: {value: null},
			batchWidth: {value: null}
		}

	]),

	vertexShader: [
		"#define PHONG",

		"varying vec3 vViewPosition;",

		"#ifndef FLAT_SHADED",
			"varying vec3 vNormal;",
		"#endif",

		"#ifdef USE_BATCHMAP",
			"uniform sampler2D batchMap;",
			"attribute float batchId;",
			"varying float vbatchId;",
		"#endif",

		ShaderChunk.common,
		ShaderChunk.uv_pars_vertex,
		ShaderChunk.uv2_pars_vertex,
		ShaderChunk.displacementmap_pars_vertex,
		ShaderChunk.envmap_pars_vertex,
		ShaderChunk.color_pars_vertex,
		ShaderChunk.fog_pars_vertex,
		ShaderChunk.morphtarget_pars_vertex,
		ShaderChunk.skinning_pars_vertex,
		ShaderChunk.shadowmap_pars_vertex,
		ShaderChunk.logdepthbuf_pars_vertex,
		ShaderChunk.clipping_planes_pars_vertex,

		"void main() {",

			"#ifdef USE_BATCHMAP",
				"vbatchId = batchId;",
			"#endif",

			ShaderChunk.uv_vertex,
			ShaderChunk.uv2_vertex,
			ShaderChunk.color_vertex,
			ShaderChunk.beginnormal_vertex,
			ShaderChunk.morphnormal_vertex,
			ShaderChunk.skinbase_vertex,
			ShaderChunk.skinnormal_vertex,
			ShaderChunk.defaultnormal_vertex,

			"#ifndef FLAT_SHADED",
				"vNormal = normalize( transformedNormal );",
			"#endif",

			ShaderChunk.begin_vertex,
			ShaderChunk.morphtarget_vertex,
			ShaderChunk.skinning_vertex,
			ShaderChunk.displacementmap_vertex,
			ShaderChunk.project_vertex,
			ShaderChunk.logdepthbuf_vertex,
			ShaderChunk.clipping_planes_vertex,

			"vViewPosition = - mvPosition.xyz;",

			ShaderChunk.worldpos_vertex,
			ShaderChunk.envmap_vertex,
			ShaderChunk.shadowmap_vertex,
			ShaderChunk.fog_vertex,

		"}",
	].join("\n"),

	fragmentShader: [
		"#define PHON",

		"uniform vec3 diffuse;",
		"uniform vec3 emissive;",
		"uniform vec3 specular;",
		"uniform float shininess;",
		"uniform float opacity;",

		"#ifdef USE_BATCHMAP",
			"uniform sampler2D batchMap;",
			"uniform float batchWidth;",
			"varying float vbatchId;",
		"#endif",

		ShaderChunk.common,
		ShaderChunk.packing,
		ShaderChunk.dithering_pars_fragment,
		ShaderChunk.color_pars_fragment,
		ShaderChunk.uv_pars_fragment,
		ShaderChunk.uv2_pars_fragment,
		ShaderChunk.map_pars_fragment,
		ShaderChunk.alphamap_pars_fragment,
		ShaderChunk.aomap_pars_fragment,
		ShaderChunk.lightmap_pars_fragment,
		ShaderChunk.emissivemap_pars_fragment,
		ShaderChunk.envmap_pars_fragment,
		ShaderChunk.gradientmap_pars_fragment,
		ShaderChunk.fog_pars_fragment,
		ShaderChunk.bsdfs,
		ShaderChunk.lights_pars_begin,
		ShaderChunk.lights_phong_pars_fragment,
		ShaderChunk.shadowmap_pars_fragment,
		ShaderChunk.bumpmap_pars_fragment,
		ShaderChunk.normalmap_pars_fragment,
		ShaderChunk.specularmap_pars_fragment,
		ShaderChunk.logdepthbuf_pars_fragment,
		ShaderChunk.clipping_planes_pars_fragment,

		"void main() {",

			ShaderChunk.clipping_planes_fragment,

			"vec4 diffuseColor = vec4( diffuse, opacity );",

			"#ifdef USE_BATCHMAP",
				"vec4 batchColor;",
				"if (vbatchId >= batchWidth){",
					"float u_v = (vbatchId+0.5) / batchWidth;",
					"float u_v_i = floor(u_v);",
					"float v = u_v_i / batchWidth;",
					"float u = u_v - u_v_i;",
					"batchColor = texture2D( batchMap,vec2( u,v ) );",
				"}else{",
					"batchColor = texture2D( batchMap,vec2( (vbatchId+0.5)/batchWidth,0.0 ) );",
				"};",
				"if ( batchColor.w == 0.0 )",
					"discard;",
				"else",
					"diffuseColor *= batchColor;",
			"#endif",

			"ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
			"vec3 totalEmissiveRadiance = emissive;",

			ShaderChunk.logdepthbuf_fragment,
			ShaderChunk.map_fragment,
			ShaderChunk.color_fragment,
			ShaderChunk.alphamap_fragment,
			ShaderChunk.alphatest_fragment,
			ShaderChunk.specularmap_fragment,
			ShaderChunk.normal_fragment_begin,
			ShaderChunk.normal_fragment_maps,
			ShaderChunk.emissivemap_fragment,
			ShaderChunk.lights_phong_fragment,
			ShaderChunk.lights_fragment_begin,
			ShaderChunk.lights_fragment_maps,
			ShaderChunk.lights_fragment_end,
			ShaderChunk.aomap_fragment,

			"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

			ShaderChunk.envmap_fragment,

			"gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			ShaderChunk.tonemapping_fragment,
			ShaderChunk.encodings_fragment,
			ShaderChunk.fog_fragment,
			ShaderChunk.premultiplied_alpha_fragment,
			ShaderChunk.dithering_fragment,
		"}",
	].join("\n")
};

export { BatchPhongShader };
