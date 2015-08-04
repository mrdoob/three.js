/**
 * @author miibond
 *
 * Down-sample a given texture to a target exactly half the size. Useful for texture packings where automatic
 * bilinear filtering is inappropriate (e.g. depthRGBA, RGBE, etc.)
 */

THREE.BilinearDownSampleShader = {

	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"resolution": { type: "v2", value: new THREE.Vector2() },
	},
	vertexShader: [
		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"
	].join('\n'),
	fragmentShader: [
		"varying vec2 vUv;",
		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",
		THREE.ShaderChunk[ "hdr_decode_pars_fragment" ],
		THREE.ShaderChunk[ "hdr_encode_pars_fragment" ],
		
		"void main() {",
			"vec2 offset = 0.5 / resolution;",
			"vec4 colour;",
			"vec4 samples[ 4 ];",

      "samples[0] = texture2D( tDiffuse, vUv + vec2( -offset.x, -offset.x ) );",
      "samples[1] = texture2D( tDiffuse, vUv + vec2( offset.x, -offset.x ) );",
      "samples[2] = texture2D( tDiffuse, vUv + vec2( offset.x, offset.y ) );",
      "samples[3] = texture2D( tDiffuse, vUv + vec2( -offset.x, offset.y ) );",

			"for ( int i = 0; i < 4; i++ ) {",
				"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
					"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
						"colour += vec4( HDRDecodeLOGLUV( samples[i] ), 1.0 );",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
						"colour += vec4( HDRDecodeRGBM( samples[i] ), 1.0 );",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
						"colour += vec4( HDRDecodeRGBD( samples[i] ), 1.0 );",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
						"colour += vec4( HDRDecodeRGBE( samples[i] ), 1.0 );",
					"#else",
						"colour += samples[i];",
					"#endif",
				"#else",
						"colour += samples[i];",
				"#endif",
			"}",

			"gl_FragColor = colour * 0.25;",
			
			THREE.ShaderChunk[ "hdr_encode_fragment" ],
			
		"}",
	].join('\n')

};
