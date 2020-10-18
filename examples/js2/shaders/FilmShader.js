"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.FilmShader = void 0;
var FilmShader = {
  uniforms: {
    "tDiffuse": {
      value: null
    },
    "time": {
      value: 0.0
    },
    "nIntensity": {
      value: 0.5
    },
    "sIntensity": {
      value: 0.05
    },
    "sCount": {
      value: 4096
    },
    "grayscale": {
      value: 1
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "	vUv = uv;", "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["#include <common>", "uniform float time;", "uniform bool grayscale;", "uniform float nIntensity;", "uniform float sIntensity;", "uniform float sCount;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "	vec4 cTextureScreen = texture2D( tDiffuse, vUv );", "	float dx = rand( vUv + time );", "	vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );", "	vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );", "	cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;", "	cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );", "	if( grayscale ) {", "		cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );", "	}", "	gl_FragColor =  vec4( cResult, cTextureScreen.a );", "}"].join("\n")
};
THREE.FilmShader = FilmShader;