import {
	Color
} from 'three';

/**
 * Color fill shader
 */

const FillShader = {

	uniforms: {

		'color': { value: new Color( 0xffffff ) },
		'opacity': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec3 color;
		uniform float opacity;

		void main() {

			gl_FragColor = vec4( color, opacity );

		}`

};

export { FillShader };
