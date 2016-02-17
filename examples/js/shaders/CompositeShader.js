/**
 * @author bhouston / http://clara.io/
 *
 * Multi-Sample Anti-aliasing shader - for blending together sample buffers
 */

THREE.CompositeShader = {

	shaderID: "composite",

	uniforms: {

		"tForeground": { type: "t", value: null },
		"scale": { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( '\n' ),

	fragmentShader: [

		"varying vec2 vUv;",

		"uniform sampler2D tForeground;",
		"uniform float scale;",

		"void main() {",

			"vec4 foreground = texture2D( tForeground, vUv );",

			"gl_FragColor = foreground * scale;",

		"}"

	].join( '\n' )

};
