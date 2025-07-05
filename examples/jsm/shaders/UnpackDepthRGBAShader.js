/**
 * @module UnpackDepthRGBAShader
 * @three_import import { UnpackDepthRGBAShader } from 'three/addons/shaders/UnpackDepthRGBAShader.js';
 */

/**
 * Unpack RGBA depth shader that shows RGBA encoded depth as monochrome color.
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

		#include <packing>

		void main() {

			float depth = unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );

			#ifdef USE_REVERSEDEPTHBUF

				if ( depth == 1.0 ) depth = 0.0; // wrong clear value?

				// [0, 1] -> [-1, 1]
				depth = depth * 2.0 - 1.0;

				// Reverse to forward depth (precision is already destroyed at this point)
				depth = 1.0 - depth;

			#endif

			gl_FragColor = vec4( vec3( 1.0 - depth ), opacity );

		}`

};

export { UnpackDepthRGBAShader };
