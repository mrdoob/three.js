/**
 * @author miibond
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.ToneMapShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"averageLuminance":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		// "uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"uniform float averageLuminance;",
		"float g_fMiddleGrey = 0.6;",
		"float g_fMaxLuminance = 16.0;",
		"const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);",

		"vec3 ToneMap( vec3 vColor ) {",
			// Get the calculated average luminance 
			"float fLumAvg = averageLuminance;//texture2D(PointSampler1, float2(0.5, 0.5)).r;",

			// Calculate the luminance of the current pixel
			"float fLumPixel = dot(vColor, LUM_CONVERT);",

			// Apply the modified operator (Eq. 4)
			"float fLumScaled = (fLumPixel * g_fMiddleGrey) / fLumAvg;",

			"float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);",
			"return fLumCompressed * vColor;",
		"}",

		THREE.ShaderChunk['hdr_decode_pars_fragment'],
		THREE.ShaderChunk['hdr_encode_pars_fragment'],

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"#ifdef LOGLUV_HDR_INPUT",
				"gl_FragColor = vec4( ToneMap( LogLuvDecode( texel ) ), 1.0 );",
			"#elif defined( RGBM_HDR_INPUT )",
				"gl_FragColor = vec4( ToneMap( RGBMDecode( texel ) ), 1.0 );",
			"#else",
				"gl_FragColor = vec4( ToneMap( texel.xyz ), 1.0 );",
			"#endif",
			// THREE.ShaderChunk['hdr_encode_fragment'],

		"}"

	].join("\n")

};
