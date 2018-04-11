/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * Colour halftone shader
 */

THREE.HalftoneShader = {
	uniforms: {
		"tDiffuse": {value: null},
		"radius": {value: 5},
		"rSample": {value: Math.PI * 0.25},
		"rC": {value: Math.PI * 0.25},
		"rM": {value: Math.PI * 0.33},
		"rY": {value: Math.PI * 0.66},
		"shape": {value: 1},
		"width": {value: 1},
		"height": {value: 1}
	},
	vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
	fragmentShader: `
		varying vec2 vUv;
		uniform sampler2D tDiffuse;
		uniform float radius;
		uniform float rSample;
		uniform float rC;
		uniform float rY;
		uniform float rM;
		uniform float width;
		uniform float height;

		float rand(vec2 seed){
    	return fract(sin(dot(seed.xy, vec2(12.9898,78.233))) * 43758.5453);
		}

		vec2 gridReference(vec2 coord, float step, float rotation) {
			return vec2(0, 0);
		}

		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			gl_FragColor = color;
		}`
};
