struct StandardMaterial {

	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;

};

void RE_Direct_Standard( const in IncidentLight directLight, const in GeometricContext geometry, const in StandardMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = dotNL * PI * directLight.color; // punctual light

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );

}

void RE_IndirectDiffuse_Standard( const in vec3 irradiance, const in GeometricContext geometry, const in StandardMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}

void RE_IndirectSpecular_Standard( const in vec3 radiance, const in GeometricContext geometry, const in StandardMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectSpecular += radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );

}

#define RE_Direct				RE_Direct_Standard
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Standard
#define RE_IndirectSpecular		RE_IndirectSpecular_Standard

#define Material_BlinnShininessExponent( material )   GGXRoughnessToBlinnExponent( material.specularRoughness )
