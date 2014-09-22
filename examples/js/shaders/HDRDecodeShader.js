/**
 * @author miibond
 *
 * Decode HDR values encoded with various algorithms
 */

THREE.HDRDecodeShader = {

	uniforms: {
		"tDiffuse": { type: "t", value: null },
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

		THREE.ShaderChunk['hdr_decode_pars_fragment'],

		"void main() {",

			"vec4 sample = texture2D(tDiffuse, vUv );",
			"#ifdef LOGLUV_HDR",
				"gl_FragColor = vec4( LogLuvDecode( sample ), 1.0 );",
			"#elif defined( RGBM_HDR )",
				"gl_FragColor = vec4( RGBMDecode( sample ), 1.0 );",
			"#else",
				"gl_FragColor = sample;",
			"#endif",

		"}"

	].join("\n")

};
