/**
 * @module BlendShader
 * @three_import import { BlendShader } from 'three/addons/shaders/BlendShader.js';
 */

/**
 * Blends two textures.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const BlendShader = {

	name: 'BlendShader',

	uniforms: {

		'tDiffuse1': { value: null },
		'tDiffuse2': { value: null },
		'mixRatio': { value: 0.5 },
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
		uniform float mixRatio;

		uniform sampler2D tDiffuse1;
		uniform sampler2D tDiffuse2;

		varying vec2 vUv;

		void main() {

			vec4 texel1 = texture2D( tDiffuse1, vUv );
			vec4 texel2 = texture2D( tDiffuse2, vUv );
			gl_FragColor = opacity * mix( texel1, texel2, mixRatio );

		}`

};

export { BlendShader };
