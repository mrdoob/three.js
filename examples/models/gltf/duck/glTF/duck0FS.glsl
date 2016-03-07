precision highp float;
varying vec3 v_normal;
uniform vec4 u_ambient;
varying vec2 v_texcoord0;
uniform sampler2D u_diffuse;
uniform vec4 u_emission;
uniform vec4 u_specular;
uniform float u_shininess;
varying vec3 v_light0Direction;
varying vec3 v_position;
uniform vec3 u_light0Color;
void main(void) {
vec3 normal = normalize(v_normal);
vec4 color = vec4(0., 0., 0., 0.);
vec4 diffuse = vec4(0., 0., 0., 1.);
vec3 diffuseLight = vec3(0., 0., 0.);
vec4 emission;
vec4 ambient;
vec4 specular;
ambient = u_ambient;
diffuse = texture2D(u_diffuse, v_texcoord0);
emission = u_emission;
specular = u_specular;
vec3 specularLight = vec3(0., 0., 0.);
{
float specularIntensity = 0.;
float attenuation = 1.0;
vec3 l = normalize(v_light0Direction);
vec3 viewDir = -normalize(v_position);
vec3 h = normalize(l+viewDir);
specularIntensity = max(0., pow(max(dot(normal,h), 0.) , u_shininess)) * attenuation;
specularLight += u_light0Color * specularIntensity;
diffuseLight += u_light0Color * max(dot(normal,l), 0.) * attenuation;
}
specular.xyz *= specularLight;
color.xyz += specular.xyz;
diffuse.xyz *= diffuseLight;
color.xyz += diffuse.xyz;
color.xyz += emission.xyz;
color = vec4(color.rgb * diffuse.a, diffuse.a);
gl_FragColor = color;
}
