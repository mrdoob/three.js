/**
 * @module LuminosityShader
 * @three_import import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
 */

/**
 * Luminosity shader.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const LuminosityShader = {

	name: 'LuminosityShader',

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

		#include <common>

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float l = luminance( texel.rgb );

			gl_FragColor = vec4( l, l, l, texel.w );

		}`

};

export { LuminosityShader };
