/**
 * @author wongbryan / http://wongbryan.github.io
 *
 * Pixelation shader
 */

THREE.PixelShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"resolution": { value: null },
		"pixelSize": { value: 1. },

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
		"uniform float pixelSize;",
		"uniform vec2 resolution;",

		"varying highp vec2 vUv;",

		"void main(){",

		"float dx = pixelSize * (1./resolution.x);",
		"float dy = dx;",
		"vec2 coord = vec2(dx * floor(vUv.x / dx), dy * floor(vUv.y / dy));",
		"gl_FragColor = texture2D(tDiffuse, coord);",

		"}"

	].join( "\n" )
};
