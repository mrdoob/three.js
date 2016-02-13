/**
 * @author bhouston / http://clara.io/
 *
 * Multi-Sample Anti-aliasing shader - for blending together sample buffers
 */

THREE.CompositeShader = {

  shaderID: "composite",

	uniforms: {

	//	"tBackground":   { type: "t", value: null },
		"tForeground":   { type: "t", value: null },
    "scale":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 vUv;",

//		"uniform sampler2D tBackground;",
		"uniform sampler2D tForeground;",
		"uniform float scale;",

    "vec4 composite( vec4 foreground, vec4 background ) {",
    	"return vec4( mix( background.rgb * background.a, foreground.rgb, foreground.a ), background.a * ( 1.0 - foreground.a ) + foreground.a );",
    "}",

		"void main() {",

		//	"vec4 background = texture2D( tBackground, vUv );",
      "vec4 foreground = texture2D( tForeground, vUv );",

			"gl_FragColor = foreground * scale;//composite( foreground, background ) * scale;",

		"}"

	].join("\n")

};
