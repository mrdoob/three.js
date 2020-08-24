console.warn( "THREE.BlendShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );
/**
 * Blend two textures
 */

THREE.BlendShader = {

	uniforms: {

		"tDiffuse1": { value: null },
		"tDiffuse2": { value: null },
		"mixRatio": { value: 0.5 },
		"opacity": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float mixRatio;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 texel1 = texture2D( tDiffuse1, vUv );",
		"	vec4 texel2 = texture2D( tDiffuse2, vUv );",
		"	gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

		"}"

	].join( "\n" )

};
