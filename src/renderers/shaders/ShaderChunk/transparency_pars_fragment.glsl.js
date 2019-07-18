export default /* glsl */`
uniform float transparency;

	// makes surface transparent without hiding the specular term
	vec4 combineLight( const in vec3 diffuseLight, const in vec3 specularLight, const in GeometricContext geometry, const in PhysicalMaterial material ) {

	float diffuseAlpha = 1. - transparency;

	vec3 fresnel = BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );
	float fresnelApprox = linearToRelativeLuminance( fresnel ); // since we can't have per-channel opacity blending, we must approximate with a single blending factor

	vec3 finalLight = diffuseLight * diffuseAlpha + specularLight;
	float finalAlpha = mix( diffuseAlpha, 1., fresnelApprox );

	if( finalAlpha < EPSILON ) return vec4( 0 );
	else return vec4( finalLight / finalAlpha, finalAlpha );

}
`;
