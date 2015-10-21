struct PhysicalMaterial {
	vec3	diffuseColor;
	float	specularRoughness;
	vec3	specularColor;
	float	clearCoatWeight;
	float	clearCoatRoughness;
};

void BRDF_PhysicalMaterial_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight directReflectedLight ) {

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

	BRDF_Lambert( directLight, geometry, material.diffuseColor, reflectedLight );

	BRDF_GGX( directLight, geometry, material.specularColor, material.roughness, reflectedLight );

#ifdef CLEARCOAT

	BRDF_GGX_ClearCoat_Over( directLight, geometry, material.clearCoatWeight, material.clearCoatRoughness, reflectedLight );

#endif

	directReflectedLight.diffuse += reflectedLight.diffuse;
	directReflectedLight.specular += reflectedLight.specular;
	
}
#define BRDF_Material_DirectLight    BRDF_PhysicalMaterial_DirectLight


void BRDF_PhysicalMaterial_DiffuseIndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight indirectReflectedLight ) {

	BRDF_Lambert( indirectLight, geometry, material.diffuseColor, indirectReflectedLight );

}

#define BRDF_Material_DiffuseIndirectLight    BRDF_PhysicalMaterial_DiffuseIndirectLight


void BRDF_PhysicalMaterial_SpecularIndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight indirectReflectedLight ) {

    BRDF_GGX_Environment( lightProbeIncidentLight, geometry, material.specularColor, material.roughness, indirectReflectedLight );

}

#define Material_LightProbeLOD( material )   (material.roughness)

#define BRDF_Material_SpecularIndirectLight    BRDF_PhysicalMaterial_SpecularIndirectLight
