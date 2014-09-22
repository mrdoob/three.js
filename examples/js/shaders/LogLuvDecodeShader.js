/**
 * @author miibond
 *
 * Decode HDR values encoded with LOG_LUV
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
		  // logLuvMatrix matrix, for encoding
		  // const mat3 logLuvMatrix = mat3(
		  //     0.2209, 0.3390, 0.4184,
		  //     0.1138, 0.6780, 0.7319,
		  //     0.0102, 0.1130, 0.2969);

		  // Inverse logLuvMatrix matrix, for decoding
		  // "const mat3 InverseLogLuvMatrix = mat3(",
		  //   "6.0013, -2.700, -1.7995,",
		  //   "-1.332, 3.1029, -5.7720,",
		  //   ".3007,  -1.088, 5.6268);  ",

			"const mat3 InverseLogLuvMatrix = mat3(",
				"6.0013, -1.332, 0.3007,",
		    "-2.700, 3.1029, -1.088,",
		    "-1.7995,  -5.7720, 5.6268);  ",

		  // vec4 LogLuvEncode(in vec3 vRGB) 
		  // {    
		  //     vec4 vResult; 
		  //     vec3 Xp_Y_XYZp = logLuvMatrix * vRGB;
		  //     Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
		  //     vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
		  //     float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
		  //     vResult.w = fract(Le);
		  //     vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
		  //     return vResult;
		  // }

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
		"#endif",

		"void main() {",

			"vec4 sample = texture2D(tDiffuse, vUv );",
			"#ifdef LOGLUV_HDR",
				"gl_FragColor = vec4( LogLuvDecode( sample ), 1.0 );",
			"#else",
				"gl_FragColor = vec4( sample, 1.0 );",
			"#endif",

		"}"

	].join("\n")

};
