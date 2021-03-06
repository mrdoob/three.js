import {
	Color,
	ShaderChunk,
	ShaderLib,
	UniformsUtils
} from '../../../build/three.module.js';

/**
 * Progressive Shadow Accumulation shaders
 * Inspired by this technique:
 * http://madebyevan.com/shaders/lightmap/
 */


/**
 * Boxcar Filter for Accumulating Shadow Samples
 * https://en.wikipedia.org/wiki/Moving_average#Simple_moving_average_(boxcar_filter)
 */
var MovingAverageAccumulationShader = {

	uniforms: {

		'averagingWindow': { value: 100 },
		'tOld': { value: null },
		'tNew': { value: null }

	},

	vertexShader: 

		`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: 

		`uniform float averagingWindow;

		uniform sampler2D tOld;
		uniform sampler2D tNew;

		varying vec2 vUv;

		void main() {

			vec4 texelOld = texture2D( tOld, vUv );
			vec4 texelNew = texture2D( tNew, vUv );

			gl_FragColor = texelOld + ((texelNew - texelOld) / averagingWindow);

		}`

};

/**
 * Equivalent to the Lambert Shader, but vertices are transformed to UV Space
 */
var LambertUVSpace = {
	// Copy Lambert's Uniforms and Fragment Shader
	uniforms      : ShaderLib  ['lambert'].uniforms,
	fragmentShader: ShaderChunk[ 'meshlambert_frag' ],

	// Splice in the UV Space Transformation
	vertexShader: [
		ShaderChunk[ 'meshlambert_vert' ].slice( 0, -2 ),
		//'	gl_Position = vec4(( uvTransform * vec3( uv, 1 ) - 0.5) * 2.0, 1.0) // Transforms verts to UV Space',
		'}'
	].join( '\n' ),
};

export { MovingAverageAccumulationShader, LambertUVSpace };
