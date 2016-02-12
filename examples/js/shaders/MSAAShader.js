/**
 * @author bhouston / http://clara.io/
 *
 * Multi-Sample Anti-aliasing shader - for blending together sample buffers
 */

THREE.MSAA4Shader = {

  shaderID: "msaa",

	uniforms: {

		"tBackground":   { type: "t", value: null },
		"tSample0":   { type: "t", value: null },
		"tSample1":   { type: "t", value: null },
		//"tSample2":   { type: "t", value: null },
		//"tSample3":   { type: "t", value: null },
		"nSamples":   { type: "i", value: 4 },
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

		"uniform sampler2D tBackground;",

		"uniform sampler2D tSample0;",
		"uniform sampler2D tSample1;",

		"uniform int nSamples;",
		"uniform float scale;",

    "vec4 composite( vec4 foreground, vec4 background ) {",
    	"return vec4( mix( background.rgb * background.a, foreground.rgb, foreground.a ), background.a * ( 1.0 - foreground.a ) + foreground.a );",
    "}",

		"void main() {",

			"vec4 background = texture2D( tBackground, vUv );",

			"vec4 foreground = composite( texture2D( tSample0, vUv ), background );",
			"if( scale < 0.9 ) {",
				"foreground += composite( texture2D( tSample1, vUv ), background );",
			"}",

			"gl_FragColor = vec4( foreground.rgb * scale, foreground.a * scale );",

		"}"

	].join("\n")

};
