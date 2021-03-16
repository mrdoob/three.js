import {
	Color
} from '../../../build/three.module.js';

/**
 * Colorify shader
 */

var ColorifyShader = {

	uniforms: {

		'tDiffuse': { value: null },
		'color': { value: new Color( 0xffffff ) }

	},

	vertexShader: [

		'varying vec2 vUv;',

		'void main() {',

		'	vUv = uv;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform vec3 color;',
		'uniform sampler2D tDiffuse;',

		'varying vec2 vUv;',

		'void main() {',

		'	vec4 texel = texture2D( tDiffuse, vUv );',

		'	vec3 luma = vec3( 0.299, 0.587, 0.114 );',
		'	float v = dot( texel.xyz, luma );',

		'	gl_FragColor = vec4( v * color, texel.w );',

		'}'

	].join( '\n' )

};

export { ColorifyShader };
