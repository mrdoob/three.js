/** @module TriangleBlurShader */

/**
 * Simulates the look of the two-strip technicolor process popular in early 20th century films.
 * More historical info here: {@link http://www.widescreenmuseum.com/oldcolor/technicolor1.htm}
 * Demo here: {@link http://charliehoey.com/technicolor_shader/shader_test.html}
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const TechnicolorShader = {

	name: 'TechnicolorShader',

	uniforms: {

		'tDiffuse': { value: null }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );
			vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);

			gl_FragColor = newTex;

		}`

};

export { TechnicolorShader };
