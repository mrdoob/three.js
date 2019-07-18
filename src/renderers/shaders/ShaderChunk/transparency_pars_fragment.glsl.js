export default /* glsl */`
uniform float transparency;

	// makes surface transparent without hiding the specular term
	vec4 combineLight( const in vec3 diffuseLight, const in vec3 specularLight, const in GeometricContext geometry, const in PhysicalMaterial material ) {

	vec4 diffuseFinal = vec4( diffuseLight * ( 1. - transparency ), 1. - transparency );

	vec3 fresnel = BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );
	float fresnelApprox = linearToRelativeLuminance( fresnel ); // since we can't have per-channel opacity blending, we must approximate with a single blending factor

	vec4 specularFinal = vec4( specularLight, fresnelApprox ); // specularLight is already premultiplied by fresnel (TODO: factor fresnel out of BSDF)

	vec4 fragColor = mix( diffuseFinal, specularFinal, fresnelApprox );

	// the above math is performed in premultiplied alpha
	fragColor.rgb /= fragColor.a;

	return fragColor;

}
`;
