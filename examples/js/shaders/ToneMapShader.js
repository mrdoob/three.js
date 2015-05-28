/**
 * @author miibond
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.ToneMapShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"averageLuminance":  { type: "f", value: 1.0 },
		"luminanceMap":  { type: "t", value: null },
		"maxLuminance":  { type: "f", value: 16.0 },
		"middleGrey":  { type: "f", value: 0.6 }
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

		"uniform float middleGrey;",
		"uniform float maxLuminance;",
		"#ifdef SAMPLE_LUMINANCE",
			"uniform sampler2D luminanceMap;",
		"#else",
			"uniform float averageLuminance;",
		"#endif",

		THREE.ShaderChunk['hdr_decode_pars_fragment'],
		THREE.ShaderChunk['hdr_encode_pars_fragment'],
		
		"const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);",

		"vec3 ToneMap( vec3 vColor ) {",
			"#ifdef SAMPLE_LUMINANCE",
				// Get the calculated average luminance 
				"vec4 lumAvg = texture2D(luminanceMap, vec2(0.5, 0.5));",
				"float fLumAvg = lumAvg.r;",
				"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
					"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
						"fLumAvg = HDRDecodeLOGLUV( lumAvg ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
						"fLumAvg = HDRDecodeRGBM( lumAvg ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
						"fLumAvg = HDRDecodeRGBD( lumAvg ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
						"fLumAvg = HDRDecodeRGBE( lumAvg ).r;",
					"#endif",
				"#endif",
			"#else",
				"float fLumAvg = averageLuminance;",
			"#endif",
			
			// Calculate the luminance of the current pixel
			"float fLumPixel = dot(vColor, LUM_CONVERT);",

			// Apply the modified operator (Eq. 4)
			"float fLumScaled = (fLumPixel * middleGrey) / fLumAvg;",

			"float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);",
			"return fLumCompressed * vColor;",
		"}",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
				"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
					"gl_FragColor = vec4( ToneMap( HDRDecodeLOGLUV( texel ) ), 1.0 );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
					"gl_FragColor = vec4( ToneMap( HDRDecodeRGBM( texel ) ), 1.0 );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
					"gl_FragColor = vec4( ToneMap( HDRDecodeRGBD( texel ) ), 1.0 );",
				"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
					"gl_FragColor = vec4( ToneMap( HDRDecodeRGBE( texel ) ), 1.0 );",
				"#else",
					"gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );",
				"#endif",
			"#else",
				"gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );",
			"#endif",

		"}"

	].join("\n")

};
