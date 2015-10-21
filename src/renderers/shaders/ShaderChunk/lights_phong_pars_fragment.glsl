#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif


struct BlinnPhongMaterial {
	vec3	diffuseColor;
	float	specularShininess;
	vec3	specularColor;
};

void BRDF_BlinnPhongMaterial_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight directReflectedLight ) {

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

	BRDF_Lambert( directLight, geometry, material.diffuseColor, directReflectedLight );
	//BRDF_OrenNayar( directLight, geometry, material.diffuseColor, 0.5, directReflectedLight );

	BRDF_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess, directReflectedLight );
	
}

#define BRDF_Material_DirectLight    BRDF_BlinnPhongMaterial_DirectLight

void BRDF_BlinnPhongMaterial_IndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight indirectReflectedLight ) {

	BRDF_Lambert( indirectLight, geometry, material.diffuseColor, indirectReflectedLight );

}

#define BRDF_Material_IndirectLight    BRDF_BlinnPhongMaterial_IndirectLight

#define Material_LightProbeLOD( material )   (0)
