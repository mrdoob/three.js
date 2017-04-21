precision highp float;
varying vec3 v_normal;
uniform vec4 u_ambient;
uniform vec4 u_diffuse;
uniform vec4 u_emission;
uniform vec4 u_specular;
uniform float u_shininess;
void main(void) {
vec3 normal = normalize(v_normal);
vec4 color = vec4(0., 0., 0., 0.);
vec4 diffuse = vec4(0., 0., 0., 1.);
vec4 emission;
vec4 ambient;
vec4 specular;
ambient = u_ambient;
diffuse = u_diffuse;
emission = u_emission;
specular = u_specular;
diffuse.xyz *= max(dot(normal,vec3(0.,0.,1.)), 0.);
color.xyz += diffuse.xyz;
color.xyz += emission.xyz;
color = vec4(color.rgb * diffuse.a, diffuse.a);
gl_FragColor = color;
}
