struct PhysicalMaterial {
	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;
	float	clearCoatWeight;
	float	clearCoatRoughness;
};

void PhysicalMaterial_RE_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	reflectedLight.directDiffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += dotNL * directLight.color * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );
	
}
#define Material_RE_DirectLight    PhysicalMaterial_RE_DirectLight


void PhysicalMaterial_RE_DiffuseIndirectLight( const in vec3 indirectDiffuseColor, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += indirectDiffuseColor * BRDF_Diffuse_Lambert( material.diffuseColor );

}

#define Material_RE_IndirectDiffuseLight    PhysicalMaterial_RE_DiffuseIndirectLight


void PhysicalMaterial_RE_SpecularIndirectLight( const in vec3 indirectSpecularColor, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

    reflectedLight.indirectSpecular += indirectSpecularColor * BRDF_Specular_GGX_Environment( geometry, material.specularColor, material.specularRoughness );

}

#define Material_BlinnShininessExponent( material )   ( 2.0 / square( material.specularRoughness + 0.0001 ) - 2.0 )

#define Material_RE_IndirectSpecularLight    PhysicalMaterial_RE_SpecularIndirectLight
