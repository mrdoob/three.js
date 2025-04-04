/** @module UnpackDepthRGBAShader */

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

			float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );
			gl_FragColor = vec4( vec3( depth ), opacity );

		}`

};

export { UnpackDepthRGBAShader };
