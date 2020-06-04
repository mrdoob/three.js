console.warn( "THREE.DotScreenShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"tSize": { value: new THREE.Vector2( 256, 256 ) },
		"center": { value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle": { value: 1.57 },
		"scale": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

		"	float s = sin( angle ), c = cos( angle );",

		"	vec2 tex = vUv * tSize - center;",
		"	vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

		"	return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

		"	vec4 color = texture2D( tDiffuse, vUv );",

		"	float average = ( color.r + color.g + color.b ) / 3.0;",

		"	gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join( "\n" )

};
