#ifdef USE_ENVMAP

	varying vec3 vWorldPosition;

#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif


struct BlinnPhongMaterial {
	vec3	diffuseColor;
	vec3	specularColor;
	float	specularShininess;
	float	specularStrength;
};

void BlinnPhongMaterial_RE_DirectLight( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight directReflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	directReflectedLight.diffuse += dotNL * directLight.color * BRDF_Diffuse_Lambert( material.diffuseColor );

	directReflectedLight.specular += dotNL * directLight.color * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

#define Material_RE_DirectLight    BlinnPhongMaterial_RE_DirectLight

void BlinnPhongMaterial_RE_IndirectDiffuseLight( const in vec3 indirectDiffuseColor, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight indirectReflectedLight ) {

	//float dotNL = saturate( dot( geometry.normal, indirectLight.direction ) );  not required because result is always 1.0

	indirectReflectedLight.diffuse += indirectDiffuseColor * BRDF_Diffuse_Lambert( material.diffuseColor );

}

#define Material_RE_IndirectDiffuseLight    BlinnPhongMaterial_RE_IndirectDiffuseLight

#define Material_LightProbeLOD( material )   (0)
