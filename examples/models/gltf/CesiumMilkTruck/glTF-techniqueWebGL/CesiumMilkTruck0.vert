precision highp float;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;
attribute vec3 a_position;
varying vec3 v_position;
attribute vec3 a_normal;
varying vec3 v_normal;
attribute vec2 a_texcoord0;
varying vec2 v_texcoord0;
void main(void) {
    vec4 pos = u_modelViewMatrix * vec4(a_position,1.0);
    v_position = pos.xyz;
    gl_Position = u_projectionMatrix * pos;
    v_normal = u_normalMatrix * a_normal;
    v_texcoord0 = a_texcoord0;
}
