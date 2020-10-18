"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TechnicolorShader = void 0;
var TechnicolorShader = {
  uniforms: {
    "tDiffuse": {
      value: null
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "	vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );", "	vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);", "	gl_FragColor = newTex;", "}"].join("\n")
};
THREE.TechnicolorShader = TechnicolorShader;