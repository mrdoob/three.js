/**
 * @author miibond
 *
 * Decode HDR values encoded with various algorithms
 */

THREE.LogLuvDecodeShader = {

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

		"#ifdef LOGLUV_HDR",
		  // Inverse logLuvMatrix matrix, for decoding
		  // "const mat3 InverseLogLuvMatrix = mat3(",
		  //   "6.0013, -2.700, -1.7995,",
		  //   "-1.332, 3.1029, -5.7720,",
		  //   ".3007,  -1.088, 5.6268);  ",

			"const mat3 InverseLogLuvMatrix = mat3(",
				"6.0013, -1.332, 0.3007,",
		    "-2.700, 3.1029, -1.088,",
		    "-1.7995,  -5.7720, 5.6268);  ",

		  
		  "vec3 LogLuvDecode(in vec4 vLogLuv)",
		  "{ ",
		    "float Le = vLogLuv.z * 255.0 + vLogLuv.w;",
		    "vec3 Xp_Y_XYZp;",
		    "Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);",
		    "Xp_Y_XYZp.z = Xp_Y_XYZp.y / vLogLuv.y;",
		    "Xp_Y_XYZp.x = vLogLuv.x * Xp_Y_XYZp.z;",
		    "vec3 vRGB = Xp_Y_XYZp * InverseLogLuvMatrix;",
		    "return clamp(vRGB, 0.0, 1.0);",
		  "}",
		"#elif RGBM_HDR",

		"vec3 RGBMDecode( vec4 rgbm ) {",
	    "return 6.0 * rgbm.rgb * rgbm.a;",
	  "}",

		"#endif",

		"void main() {",

			"vec4 sample = texture2D(tDiffuse, vUv );",
			"#ifdef LOGLUV_HDR",
				"gl_FragColor = vec4( LogLuvDecode( sample ), 1.0 );",
			"#elif RGBM_HDR",
				"gl_FragColor = vec4( RGBMDecode( sample ), 1.0 );",
			"#else",
				"gl_FragColor = vec4( sample, 1.0 );",
			"#endif",

		"}"

	].join("\n")

};
