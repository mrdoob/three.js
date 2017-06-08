precision highp float;
uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;
uniform mat4 u_jointMatrix[19];
attribute vec3 a_position;
varying vec3 v_position;
attribute vec3 a_normal;
varying vec3 v_normal;
attribute vec2 a_texcoord0;
varying vec2 v_texcoord0;
attribute vec4 a_joint;
attribute vec4 a_weight;
void main(void) {
    mat4 skinMat = a_weight.x * u_jointMatrix[int(a_joint.x)];
    skinMat += a_weight.y * u_jointMatrix[int(a_joint.y)];
    skinMat += a_weight.z * u_jointMatrix[int(a_joint.z)];
    skinMat += a_weight.w * u_jointMatrix[int(a_joint.w)];
    vec4 pos = u_modelViewMatrix * skinMat * vec4(a_position,1.0);
    v_position = pos.xyz;
    gl_Position = u_projectionMatrix * pos;
    v_normal = u_normalMatrix * mat3(skinMat) * a_normal;
    v_texcoord0 = a_texcoord0;
}
