/**
 * @author wongbryan / http://wongbryan.github.io
 *
 * Pixelation shader
 */

THREE.PixelShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"pixels": { value: 2048. },
		"step": { value: 1. }

	},

	vertexShader: [

		"varying highp vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float pixels;",
		"uniform float step;",

		"varying highp vec2 vUv;",

		"void main(){",

		"float dx = step*(1.0 / pixels);",
		"float dy = step*(1.0 / pixels);",
		"vec2 coord = vec2(dx * floor(vUv.x / dx), dy * floor(vUv.y / dy));",
		"gl_FragColor = texture2D(tDiffuse, coord);",

		"}"

	].join( "\n" )
};
