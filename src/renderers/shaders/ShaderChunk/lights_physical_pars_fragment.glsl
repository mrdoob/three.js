struct PhysicalMaterial {
	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;
	float	clearCoatWeight;
	float	clearCoatRoughness;
};

void PhysicalMaterial_RE_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight directReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	directReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, material.diffuseColor );
	directReflectedLight.specular += dotNL * directLight.color * BRDF_Specular_GGX( directLight, geometry, material.specularColor, material.specularRoughness );
	
}
#define Material_RE_DirectLight    PhysicalMaterial_RE_DirectLight


void PhysicalMaterial_RE_DiffuseIndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight indirectReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, indirectLight.direction ) );

	indirectReflectedLight.diffuse += dotNL * indirectLight.color * BRDF_Diffuse_Lambert( indirectLight, geometry, material.diffuseColor );

}

#define Material_RE_IndirectDiffuseLight    PhysicalMaterial_RE_DiffuseIndirectLight


void PhysicalMaterial_RE_SpecularIndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight indirectReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, indirectLight.direction ) );

    indirectReflectedLight.specular += dotNL * indirectLight.color * BRDF_Specular_GGX_Environment( indirectLight, geometry, material.specularColor, material.specularRoughness );

}

// from bhouston - there are other models for this calculation (roughness; not roughnesFactor)
#define Material_LightProbeLOD( material )   (pow( ( material.specularRoughness - 0.5 ) * 2.0, 0.5 ) * 7.0)

#define Material_RE_IndirectSpecularLight    PhysicalMaterial_RE_SpecularIndirectLight
