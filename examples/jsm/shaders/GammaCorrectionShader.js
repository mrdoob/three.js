/** @module GammaCorrectionShader */

/**
 * Gamma Correction Shader
 *
 * References:
 * - {@link http://en.wikipedia.org/wiki/gamma_correction}.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const GammaCorrectionShader = {

	name: 'GammaCorrectionShader',

	uniforms: {

		'tDiffuse': { value: null }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vUv );

			gl_FragColor = sRGBTransferOETF( tex );

		}`

};

export { GammaCorrectionShader };
