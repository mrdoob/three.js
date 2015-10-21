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


void BRDF_PhysicalMaterial_IndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight indirectReflectedLight ) {

	BRDF_Lambert( indirectLight, geometry, material.diffuseColor, indirectReflectedLight );

}

#define BRDF_Material_DirectLight    BRDF_PhysicalMaterial_DirectLight
#define BRDF_Material_IndirectLight    BRDF_PhysicalMaterial_IndirectLight
