console.warn( "THREE.BasicShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/#manual/en/introduction/Installation." );
/**
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: [

		"void main() {",

		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"void main() {",

		"	gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

		"}"

	].join( "\n" )

};
