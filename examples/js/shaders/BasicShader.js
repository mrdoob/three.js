/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: /* glsl */`
		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}
	`,

	fragmentShader: /* glsl */`
		void main() {

			gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );

		}
	`
};
