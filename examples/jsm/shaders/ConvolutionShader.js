import {
	Vector2
} from 'three';

/** @module ConvolutionShader */

/**
 * Convolution shader ported from o3d sample to WebGL / GLSL.
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const ConvolutionShader = {

	name: 'ConvolutionShader',

	defines: {

		'KERNEL_SIZE_FLOAT': '25.0',
		'KERNEL_SIZE_INT': '25'

	},

	uniforms: {

		'tDiffuse': { value: null },
		'uImageIncrement': { value: new Vector2( 0.001953125, 0.0 ) },
		'cKernel': { value: [] }

	},

	vertexShader: /* glsl */`

		uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float cKernel[ KERNEL_SIZE_INT ];

		uniform sampler2D tDiffuse;
		uniform vec2 uImageIncrement;

		varying vec2 vUv;

		void main() {

			vec2 imageCoord = vUv;
			vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );

			for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {

				sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];
				imageCoord += uImageIncrement;

			}

			gl_FragColor = sum;

		}`
};

export { ConvolutionShader };
