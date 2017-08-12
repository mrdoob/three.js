/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)
 *
 * As mentioned in the video the Sobel operator expects a grayscale image as input.
 *
 */

THREE.SobelOperatorShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"resolution": { value: new THREE.Vector2() }

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",

		"void main() {",

			// kernel definition (in glsl matrices are filled in column-major order)

			"const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );", // x direction kernel
      "const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );", // y direction kernel

			// fetch the 3x3 neighbourhood of a fragment

			"vec2 p = vec2( gl_FragCoord.x, gl_FragCoord.y );",

			// first column

			"vec2 x0y0 = ( p + vec2( -1, -1 ) ) / resolution;",
			"vec2 x0y1 = ( p + vec2( -1,  0 ) ) / resolution;",
			"vec2 x0y2 = ( p + vec2( -1,  1 ) ) / resolution;",

			// second column

			"vec2 x1y0 = ( p + vec2(  0, -1 ) ) / resolution;",
			"vec2 x1y1 = ( p + vec2(  0,  0 ) ) / resolution;",
			"vec2 x1y2 = ( p + vec2(  0,  1 ) ) / resolution;",

			// third column

			"vec2 x2y0 = ( p + vec2(  1, -1 ) ) / resolution;",
			"vec2 x2y1 = ( p + vec2(  1,  0 ) ) / resolution;",
			"vec2 x2y2 = ( p + vec2(  1,  1 ) ) / resolution;",

			// sample values (we assume grayscale colors so only read a single channel)

			"float tx0y0 = texture2D( tDiffuse, x0y0 ).r;",
			"float tx0y1 = texture2D( tDiffuse, x0y1 ).r;",
			"float tx0y2 = texture2D( tDiffuse, x0y2 ).r;",

			"float tx1y0 = texture2D( tDiffuse, x1y0 ).r;",
			"float tx1y1 = texture2D( tDiffuse, x1y1 ).r;",
			"float tx1y2 = texture2D( tDiffuse, x1y2 ).r;",

			"float tx2y0 = texture2D( tDiffuse, x2y0 ).r;",
			"float tx2y1 = texture2D( tDiffuse, x2y1 ).r;",
			"float tx2y2 = texture2D( tDiffuse, x2y2 ).r;",

			// gradient value in x direction

			"float valueGx = 	Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ",
			"									Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ",
			"									Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ",

			// gradient value in y direction

			"float valueGy = 	Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ",
			"									Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ",
			"									Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ",

			// magnitute of the total gradient

			"float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );",

			"gl_FragColor = vec4( vec3( G ), 1 );",

		"}"

	].join( "\n" )

};
