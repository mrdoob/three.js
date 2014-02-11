precision highp float;
attribute vec3 a_position;
attribute vec3 a_normal;
varying vec3 v_normal;
uniform mat3 u_normalMatrix;
uniform mat4 u_worldViewMatrix;
uniform mat4 u_projectionMatrix;
void main(void) {
v_normal = normalize(u_normalMatrix * a_normal);
vec4 pos = u_worldViewMatrix * vec4(a_position,1.0);
gl_Position = u_projectionMatrix * pos;
}
