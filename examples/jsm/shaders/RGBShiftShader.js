/** @module RGBShiftShader */

/**
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from https://web.archive.org/web/20090820185047/http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / https://web.archive.org/web/20090810054752/http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 *
 * @constant
 * @type {ShaderMaterial~Shader}
 */
const RGBShiftShader = {

	name: 'RGBShiftShader',

	uniforms: {

		'tDiffuse': { value: null },
		'amount': { value: 0.005 },
		'angle': { value: 0.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform float amount;
		uniform float angle;

		varying vec2 vUv;

		void main() {

			vec2 offset = amount * vec2( cos(angle), sin(angle));
			vec4 cr = texture2D(tDiffuse, vUv + offset);
			vec4 cga = texture2D(tDiffuse, vUv);
			vec4 cb = texture2D(tDiffuse, vUv - offset);
			gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);

		}`

};

export { RGBShiftShader };
