uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec4 position;
attribute vec3 normal;
attribute vec3 tangent;

attribute vec4 uv;

varying vec3 var_position_es;
varying vec3 var_normal_es;
varying vec3 var_tangent_es;

varying vec2 var_mainUv;
varying vec2 var_d1Uv;
varying vec2 var_d2Uv;
