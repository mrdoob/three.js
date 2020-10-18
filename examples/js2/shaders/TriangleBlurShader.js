"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TriangleBlurShader = void 0;
var TriangleBlurShader = {
  uniforms: {
    "texture": {
      value: null
    },
    "delta": {
      value: new THREE.Vector2(1, 1)
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["#include <common>", "#define ITERATIONS 10.0", "uniform sampler2D texture;", "uniform vec2 delta;", "varying vec2 vUv;", "void main() {", "	vec4 color = vec4( 0.0 );", "	float total = 0.0;", "	float offset = rand( vUv );", "	for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {", "		float percent = ( t + offset - 0.5 ) / ITERATIONS;", "		float weight = 1.0 - abs( percent );", "		color += texture2D( texture, vUv + delta * percent ) * weight;", "		total += weight;", "	}", "	gl_FragColor = color / total;", "}"].join("\n")
};
THREE.TriangleBlurShader = TriangleBlurShader;