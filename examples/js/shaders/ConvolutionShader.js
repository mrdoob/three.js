/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { type: "t", value: null },
		"uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { type: "fv1", value: [] },
		"averageLuminance":        { type: "f", value: 5 }
	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		THREE.ShaderChunk['hdr_decode_pars_fragment'],
		THREE.ShaderChunk['hdr_encode_pars_fragment'],

		"uniform float averageLuminance;",
		"float g_fMiddleGrey = 0.6;",
		"float g_fMaxLuminance = 16.0;",
		"const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);",

		"vec3 ToneMap( vec3 vColor )",
		"{",
			// Get the calculated average luminance 
			"float fLumAvg = averageLuminance;//texture2D(PointSampler1, float2(0.5, 0.5)).r;",

			// Calculate the luminance of the current pixel
			"float fLumPixel = dot(vColor, LUM_CONVERT);",

			// Apply the modified operator (Eq. 4)
			"float fLumScaled = (fLumPixel * g_fMiddleGrey) / fLumAvg;",

			"float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);",
			"return fLumCompressed * vColor;",
		"}",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",
			"vec4 hdr = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"hdr = texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"#ifdef LOGLUV_HDR",
					"hdr.xyz = LogLuvDecode( hdr );",
				"#elif defined( RGBM_HDR )",
					"hdr.xyz = RGBMDecode( hdr );",
				"#endif",
				// "sum += vec4( ToneMap( hdr.xyz ), 1.0 );",
				"sum += hdr;",

				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",
			THREE.ShaderChunk['hdr_encode_fragment'],

		"}"


	].join("\n"),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

		return values;

	}

};
