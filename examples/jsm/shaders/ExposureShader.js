/**
 * @module ExposureShader
 * @three_import import { ExposureShader } from 'three/addons/shaders/ExposureShader.js';
 */

/**
 * TODO
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const ExposureShader = {

	name: 'ExposureShader',

	uniforms: {

		'tDiffuse': { value: null },
		'exposure': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float exposure;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.rgb *= exposure;

		}`

};

export { ExposureShader };
