import {
	Color
} from 'three';

/**
 * @module ColorifyShader
 * @three_import import { ColorifyShader } from 'three/addons/shaders/ColorifyShader.js';
 */

/**
 * Colorify shader.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const ColorifyShader = {

	name: 'ColorifyShader',

	uniforms: {

		'tDiffuse': { value: null },
		'color': { value: new Color( 0xffffff ) }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 color;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			gl_FragColor = vec4( v * color, texel.w );

		}`

};

export { ColorifyShader };
