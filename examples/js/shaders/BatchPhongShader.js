/**
 * @author Min.H
 *
 * just for MeshPhongMaterial
 *
 * add batchMap,use map color decide the diffuse color, it cost more memory to cut draw call number.
 */

THREE.BatchPhongShader = {

	uniforms: THREE.UniformsUtils.merge([

		THREE.ShaderLib.phong.uniforms,

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

		THREE.ShaderChunk.common,
		THREE.ShaderChunk.uv_pars_vertex,
		THREE.ShaderChunk.uv2_pars_vertex,
		THREE.ShaderChunk.displacementmap_pars_vertex,
		THREE.ShaderChunk.envmap_pars_vertex,
		THREE.ShaderChunk.color_pars_vertex,
		THREE.ShaderChunk.fog_pars_vertex,
		THREE.ShaderChunk.morphtarget_pars_vertex,
		THREE.ShaderChunk.skinning_pars_vertex,
		THREE.ShaderChunk.shadowmap_pars_vertex,
		THREE.ShaderChunk.logdepthbuf_pars_vertex,
		THREE.ShaderChunk.clipping_planes_pars_vertex,

		"void main() {",

			"#ifdef USE_BATCHMAP",
				"vbatchId = batchId;",
			"#endif",

			THREE.ShaderChunk.uv_vertex,
			THREE.ShaderChunk.uv2_vertex,
			THREE.ShaderChunk.color_vertex,
			THREE.ShaderChunk.beginnormal_vertex,
			THREE.ShaderChunk.morphnormal_vertex,
			THREE.ShaderChunk.skinbase_vertex,
			THREE.ShaderChunk.skinnormal_vertex,
			THREE.ShaderChunk.defaultnormal_vertex,

			"#ifndef FLAT_SHADED",
				"vNormal = normalize( transformedNormal );",
			"#endif",

			THREE.ShaderChunk.begin_vertex,
			THREE.ShaderChunk.morphtarget_vertex,
			THREE.ShaderChunk.skinning_vertex,
			THREE.ShaderChunk.displacementmap_vertex,
			THREE.ShaderChunk.project_vertex,
			THREE.ShaderChunk.logdepthbuf_vertex,
			THREE.ShaderChunk.clipping_planes_vertex,

			"vViewPosition = - mvPosition.xyz;",

			THREE.ShaderChunk.worldpos_vertex,
			THREE.ShaderChunk.envmap_vertex,
			THREE.ShaderChunk.shadowmap_vertex,
			THREE.ShaderChunk.fog_vertex,

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

		THREE.ShaderChunk.common,
		THREE.ShaderChunk.packing,
		THREE.ShaderChunk.dithering_pars_fragment,
		THREE.ShaderChunk.color_pars_fragment,
		THREE.ShaderChunk.uv_pars_fragment,
		THREE.ShaderChunk.uv2_pars_fragment,
		THREE.ShaderChunk.map_pars_fragment,
		THREE.ShaderChunk.alphamap_pars_fragment,
		THREE.ShaderChunk.aomap_pars_fragment,
		THREE.ShaderChunk.lightmap_pars_fragment,
		THREE.ShaderChunk.emissivemap_pars_fragment,
		THREE.ShaderChunk.envmap_pars_fragment,
		THREE.ShaderChunk.gradientmap_pars_fragment,
		THREE.ShaderChunk.fog_pars_fragment,
		THREE.ShaderChunk.bsdfs,
		THREE.ShaderChunk.lights_pars_begin,
		THREE.ShaderChunk.lights_phong_pars_fragment,
		THREE.ShaderChunk.shadowmap_pars_fragment,
		THREE.ShaderChunk.bumpmap_pars_fragment,
		THREE.ShaderChunk.normalmap_pars_fragment,
		THREE.ShaderChunk.specularmap_pars_fragment,
		THREE.ShaderChunk.logdepthbuf_pars_fragment,
		THREE.ShaderChunk.clipping_planes_pars_fragment,

		"void main() {",

			THREE.ShaderChunk.clipping_planes_fragment,

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

			THREE.ShaderChunk.logdepthbuf_fragment,
			THREE.ShaderChunk.map_fragment,
			THREE.ShaderChunk.color_fragment,
			THREE.ShaderChunk.alphamap_fragment,
			THREE.ShaderChunk.alphatest_fragment,
			THREE.ShaderChunk.specularmap_fragment,
			THREE.ShaderChunk.normal_fragment_begin,
			THREE.ShaderChunk.normal_fragment_maps,
			THREE.ShaderChunk.emissivemap_fragment,
			THREE.ShaderChunk.lights_phong_fragment,
			THREE.ShaderChunk.lights_fragment_begin,
			THREE.ShaderChunk.lights_fragment_maps,
			THREE.ShaderChunk.lights_fragment_end,
			THREE.ShaderChunk.aomap_fragment,

			"vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;",

			THREE.ShaderChunk.envmap_fragment,

			"gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

			THREE.ShaderChunk.tonemapping_fragment,
			THREE.ShaderChunk.encodings_fragment,
			THREE.ShaderChunk.fog_fragment,
			THREE.ShaderChunk.premultiplied_alpha_fragment,
			THREE.ShaderChunk.dithering_fragment,
		"}",
	].join("\n")
};
