struct PhysicalMaterial {
	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;
	float	clearCoatWeight;
	float	clearCoatRoughness;
};

void PhysicalMaterial_RE_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = dotNL * PI * directLight.color; // punctual light

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );

}

void PhysicalMaterial_RE_DiffuseIndirectLight( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}

void PhysicalMaterial_RE_SpecularIndirectLight( const in vec3 radiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectSpecular += radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );

}

#define Material_RE_DirectLight    PhysicalMaterial_RE_DirectLight
#define Material_RE_IndirectDiffuseLight    PhysicalMaterial_RE_DiffuseIndirectLight
#define Material_RE_IndirectSpecularLight    PhysicalMaterial_RE_SpecularIndirectLight

#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )
