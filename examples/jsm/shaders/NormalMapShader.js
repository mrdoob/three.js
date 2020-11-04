import {
	Vector2
} from "../../../build/three.module.js";

/**
 * Normal map shader
 * - compute normals from heightmap
 */

var NormalMapShader = {

	uniforms: {

		"heightMap": { value: null },
		"resolution": { value: new Vector2( 512, 512 ) },
		"scale": { value: new Vector2( 1, 1 ) },
		"height": { value: 0.05 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float height;",
		"uniform vec2 resolution;",
		"uniform sampler2D heightMap;",

		"varying vec2 vUv;",

		"void main() {",

		"	float val = texture2D( heightMap, vUv ).x;",

		"	float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
		"	float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

		"	gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",

		"}"

	].join( "\n" )

};

export { NormalMapShader };
