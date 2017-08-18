precision highp float;
uniform sampler2D u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_transparency;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_texcoord0;
void main(void) {
    vec3 normal = normalize(v_normal);
    vec4 diffuse = texture2D(u_diffuse, v_texcoord0);
    vec3 diffuseLight = vec3(0.0, 0.0, 0.0);
    vec3 specular = u_specular.rgb;
    vec3 specularLight = vec3(0.0, 0.0, 0.0);
    vec3 ambient = diffuse.rgb;
    vec3 viewDir = -normalize(v_position);
    vec3 ambientLight = vec3(0.0, 0.0, 0.0);
    ambientLight += vec3(0.2, 0.2, 0.2);
    vec3 l = vec3(0.0, 0.0, 1.0);
    diffuseLight += vec3(1.0, 1.0, 1.0) * max(dot(normal, l), 0.); 
    vec3 reflectDir = reflect(-l, normal);
    float specularIntensity = max(0., pow(max(dot(reflectDir, viewDir), 0.), u_shininess));
    specularLight += vec3(1.0, 1.0, 1.0) * specularIntensity;
    vec3 color = vec3(0.0, 0.0, 0.0);
    color += diffuse.rgb * diffuseLight;
    color += specular * specularLight;
    color += ambient * ambientLight;
    gl_FragColor = vec4(color * diffuse.a * u_transparency, diffuse.a * u_transparency);
}
