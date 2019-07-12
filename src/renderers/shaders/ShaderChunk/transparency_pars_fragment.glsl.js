export default /* glsl */`
uniform float transparency;

// makes surface transparent without hiding the specular term
vec4 combineLight(const in vec3 diffuseLight, const in vec3 specularLight, const in GeometricContext geometry, const in PhysicalMaterial material) {

  vec3 fresnel = BRDF_Specular_GGX_Environment(geometry, material.specularColor, material.specularRoughness);

  // since we can't have per-channel opacity blending, we must settle for a single float (reflectance)
  float reflectance = (fresnel.r + fresnel.g + fresnel.b) * (1. / 3.);

  vec4 fragColor = vec4(specularLight, reflectance); // specularLight is already premultiplied by fresnel

  float diffuseAlpha = (1. - reflectance) * (1. - transparency);
  fragColor += vec4(diffuseLight * diffuseAlpha, diffuseAlpha);

  // the above math is performed in premultiplied alpha
  fragColor.rgb /= fragColor.a;

  return fragColor;

}
`;
