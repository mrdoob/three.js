/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"maxLuminance": { type: "f", value: 100.0 }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"#ifdef MAX_LUMINANCE",
			"uniform float maxLuminance;",
		"#endif",

		"varying vec2 vUv;",

		THREE.ShaderChunk[ "hdr_decode_pars_fragment" ],
		THREE.ShaderChunk[ "hdr_encode_pars_fragment" ],

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			
			"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
				"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
					"texel.xyz = HDRDecodeLOGLUV( texel );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
					"texel.xyz = HDRDecodeRGBM( texel );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
					"texel.xyz = HDRDecodeRGBD( texel );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
					"texel.xyz = HDRDecodeRGBE( texel );",
				"#endif",
			"#endif",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"#ifdef MAX_LUMINANCE",
				"v = clamp( v, 0.0, maxLuminance );",
			"#endif",
			"gl_FragColor = vec4( v, v, v, texel.w );",

			THREE.ShaderChunk[ "hdr_encode_fragment" ],

		"}"

	].join("\n")

};
