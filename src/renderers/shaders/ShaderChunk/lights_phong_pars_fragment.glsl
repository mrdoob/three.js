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

void BlinnPhongMaterial_RE_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight directReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	directReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( directLight, geometry, material.diffuseColor );
	//directReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_OrenNayar( directLight, geometry, material.diffuseColor, 0.5 );

	directReflectedLight.specular += dotNL * directLight.color * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess );
	
}

#define Material_RE_DirectLight    BlinnPhongMaterial_RE_DirectLight

void BlinnPhongMaterial_RE_IndirectLight( const in IncidentLight indirectLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight indirectReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, indirectLight.direction ) );

	indirectReflectedLight.diffuse += dotNL * indirectLight.color * BRDF_Diffuse_Lambert( indirectLight, geometry, material.diffuseColor );

}

#define Material_RE_IndirectDiffuseLight    BlinnPhongMaterial_RE_IndirectLight

#define Material_LightProbeLOD( material )   (0)
