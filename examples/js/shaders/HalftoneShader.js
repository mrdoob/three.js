/**
 * @author meatbags / http://xavierburrow.com/
 *
 * Colour halftone shader
 */

THREE.HalftonShader = {
	uniforms: {
		"tDiffuse": {value: null},
	},
	vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			gl_FragColor = color;
		}`
};
