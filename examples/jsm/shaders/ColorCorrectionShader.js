import {
	vec3Create,
	vec3Set
} from 'three';

/**
 * @module ColorCorrectionShader
 * @three_import import { ColorCorrectionShader } from 'three/addons/shaders/ColorCorrectionShader.js';
 */

/**
 * Color correction shader.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const ColorCorrectionShader = {

	name: 'ColorCorrectionShader',

	uniforms: {

		'tDiffuse': { value: null },
		'powRGB': { value: vec3Set( vec3Create(), 2, 2, 2 ) },
		'mulRGB': { value: vec3Set( vec3Create(), 1, 1, 1 ) },
		'addRGB': { value: vec3Set( vec3Create(), 0, 0, 0 ) }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform vec3 powRGB;
		uniform vec3 mulRGB;
		uniform vec3 addRGB;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );

		}`

};

export { ColorCorrectionShader };
