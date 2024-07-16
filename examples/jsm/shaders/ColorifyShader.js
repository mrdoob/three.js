import {
	Color,
	ColorManagement,
	Vector3
} from 'three';

/**
 * Colorify shader
 */

const ColorifyShader = {

	name: 'ColorifyShader',

	uniforms: {

		'tDiffuse': { value: null },
		'color': { value: new Color( 0xffffff ) },
		'luminanceCoefficients': { value: ColorManagement.getLuminanceCoefficients( new Vector3() ) },

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 color;
		uniform vec3 luminanceCoefficients;
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = dot( texel.xyz, luminanceCoefficients );

			gl_FragColor = vec4( v * color, texel.w );

		}`

};

export { ColorifyShader };
