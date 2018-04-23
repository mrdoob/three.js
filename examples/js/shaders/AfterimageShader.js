/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 *
 * Afterimage shader
 * I created this effect inspired by a demo on codepen:
 * https://codepen.io/brunoimbrizi/pen/MoRJaN?page=1&
 */

THREE.AfterimageShader = {

	uniforms: {

		"damp": { value: 0.96 },
		"tOld": { value: null },
		"tNew": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float damp;",

		"uniform sampler2D tOld;",
		"uniform sampler2D tNew;",

		"varying vec2 vUv;",
		
		"float when_gt( float x, float y ) {",

			"return max( sign( x - y ), 0.0 );",

		"}",

		"void main() {",

			"vec4 texelOld = texture2D( tOld, vUv );",
			"vec4 texelNew = texture2D( tNew, vUv );",
			
			"texelOld *= damp;",
			
			"texelOld.r *= when_gt( texelOld.r, 0.1 );",
			"texelOld.g *= when_gt( texelOld.g, 0.1 );",
			"texelOld.b *= when_gt( texelOld.b, 0.1 );",
			"texelOld.a *= when_gt( texelOld.a, 0.1 );",

			"gl_FragColor = vec4(",

				"max( texelNew.r, texelOld.r ),",
				"max( texelNew.g, texelOld.g ),",
				"max( texelNew.b, texelOld.b ),",
				"max( texelNew.a, texelOld.a )",

			");",

		"}"

	].join( "\n" )

};
