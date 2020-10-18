"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.BasicShader = void 0;
var BasicShader = {
  uniforms: {},
  vertexShader: ["void main() {", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["void main() {", "	gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );", "}"].join("\n")
};
THREE.BasicShader = BasicShader;