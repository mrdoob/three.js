/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null }

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

		"varying vec2 vUv;",

		THREE.ShaderChunk[ "hdr_decode_pars_fragment" ],
		THREE.ShaderChunk[ "hdr_encode_pars_fragment" ],

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			// "texel = texel * texel;",

			"#ifdef HDR_INPUT_LOGLUV",
				"texel.xyz = HDRDecodeLOGLUV( texel );",
			"#elif defined( HDR_INPUT_RGBM )",
				"texel.xyz = HDRDecodeRGBM( texel );",
			"#endif",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( vec3( v ), texel.w );",

			THREE.ShaderChunk[ "hdr_encode_fragment" ],

		"}"

	].join("\n")

};
