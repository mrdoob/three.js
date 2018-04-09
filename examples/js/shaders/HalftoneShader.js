/**
 * @author meatbags / http://xavierburrow.com/
 *
 * Colour halftone shader
 */

THREE.HalftoneShader = {
	uniforms: {
		"tDiffuse": {value: null},
		"iSize": {value: 1}
	},
	vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform int size;
		varying vec2 vUv;

		float rand(vec2 seed){
    	return fract(sin(dot(seed.xy, vec2(12.9898,78.233))) * 43758.5453);
		}

		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			color.r += rand(vUv) * 0.1;
			gl_FragColor = color;
		}`
};
