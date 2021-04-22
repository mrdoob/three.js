( function () {

	/**
 * Simple test shader
 */
	const BasicShader = {
		uniforms: {},
		vertexShader:
  /* glsl */
  `

		void main() {

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		void main() {

			gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );

		}`
	};

	THREE.BasicShader = BasicShader;

} )();
