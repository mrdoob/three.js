console.warn( "THREE.LuminosityHighPassShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );
/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityHighPassShader = {

	shaderID: "luminosityHighPass",

	uniforms: {

		"tDiffuse": { value: null },
		"luminosityThreshold": { value: 1.0 },
		"smoothWidth": { value: 1.0 },
		"defaultColor": { value: new THREE.Color( 0x000000 ) },
		"defaultOpacity": { value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",

		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 defaultColor;",
		"uniform float defaultOpacity;",
		"uniform float luminosityThreshold;",
		"uniform float smoothWidth;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, vUv );",

		"	vec3 luma = vec3( 0.299, 0.587, 0.114 );",

		"	float v = dot( texel.xyz, luma );",

		"	vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

		"	float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

		"	gl_FragColor = mix( outputColor, texel, alpha );",

		"}"

	].join( "\n" )

};
