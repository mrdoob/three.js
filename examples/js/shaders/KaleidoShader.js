console.warn( "THREE.KaleidoShader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"sides": { value: 6.0 },
		"angle": { value: 0.0 }

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
		"uniform float sides;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec2 p = vUv - 0.5;",
		"	float r = length(p);",
		"	float a = atan(p.y, p.x) + angle;",
		"	float tau = 2. * 3.1416 ;",
		"	a = mod(a, tau/sides);",
		"	a = abs(a - tau/sides/2.) ;",
		"	p = r * vec2(cos(a), sin(a));",
		"	vec4 color = texture2D(tDiffuse, p + 0.5);",
		"	gl_FragColor = color;",

		"}"

	].join( "\n" )

};
