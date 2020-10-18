"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.DOFMipMapShader = void 0;
var DOFMipMapShader = {
  uniforms: {
    "tColor": {
      value: null
    },
    "tDepth": {
      value: null
    },
    "focus": {
      value: 1.0
    },
    "maxblur": {
      value: 1.0
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["uniform float focus;", "uniform float maxblur;", "uniform sampler2D tColor;", "uniform sampler2D tDepth;", "varying vec2 vUv;", "void main() {", "	vec4 depth = texture2D( tDepth, vUv );", "	float factor = depth.x - focus;", "	vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );", "	gl_FragColor = col;", "	gl_FragColor.a = 1.0;", "}"].join("\n")
};
THREE.DOFMipMapShader = DOFMipMapShader;