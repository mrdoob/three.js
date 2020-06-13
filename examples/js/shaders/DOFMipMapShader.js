console.warn( "THREE.DOFMipMapShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

THREE.DOFMipMapShader = {

	uniforms: {

		"tColor": { value: null },
		"tDepth": { value: null },
		"focus": { value: 1.0 },
		"maxblur": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float focus;",
		"uniform float maxblur;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 depth = texture2D( tDepth, vUv );",

		"	float factor = depth.x - focus;",

		"	vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );",

		"	gl_FragColor = col;",
		"	gl_FragColor.a = 1.0;",

		"}"

	].join( "\n" )

};
