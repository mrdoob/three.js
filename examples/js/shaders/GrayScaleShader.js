/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * see https://en.wikipedia.org/wiki/Grayscale
 *
 */

THREE.GrayScaleShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"const vec3 weight = vec3( 0.2126, 0.7152, 0.0722 );",

			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

			"float luminance = dot( color, weight );",

			"gl_FragColor = vec4( vec3( luminance ), 1 );",

		"}"

	].join( "\n" )

};
