/**
 * @module UnpackDepthRGBAShader
 * @three_import import { UnpackDepthRGBAShader } from 'three/addons/shaders/UnpackDepthRGBAShader.js';
 */

/**
 * Depth visualization shader that shows depth values as monochrome color.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const UnpackDepthRGBAShader = {

	name: 'UnpackDepthRGBAShader',

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			float depth = texture2D( tDiffuse, vUv ).r;

			#ifdef USE_REVERSED_DEPTH_BUFFER

				gl_FragColor = vec4( vec3( depth ), opacity );

			#else

				gl_FragColor = vec4( vec3( 1.0 - depth ), opacity );

			#endif

		}`

};

export { UnpackDepthRGBAShader };
