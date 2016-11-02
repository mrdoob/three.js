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

// Area light computation code taken from:
// http://blog.selfshadow.com/sandbox/ltc.html
//
// Part of paper:
// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// By: Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// https://eheitzresearch.wordpress.com/415-2/

void RE_Area_BlinnPhong( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	// Deal with colors in linear space
	// TODO (abelnation): confirm this transformation is needed and correct
	const float gamma = 2.2;
	vec3 matDiffColor = GammaToLinear( vec4( material.diffuseColor, 1.0 ), gamma ).xyz;
	vec3 matSpecColor = GammaToLinear( vec4( material.specularColor, 1.0 ), gamma ).xyz;
	vec3 lightColor = GammaToLinear( vec4( rectAreaLight.color, 1.0 ), gamma ).xyz;

	// TODO (abelnation): determine is shininess needs to be converted to "roughness" as defined by paper
	float roughness = BlinnExponentToGGXRoughness( material.specularShininess );

	// Represent our RectAreaLight shape with a Rect
	Rect rect;
	rect.center = rectAreaLight.position;
	rect.halfx = rectAreaLight.width * 0.5;
	rect.halfy = rectAreaLight.height * 0.5;
	rect.dirx = ( rectAreaLight.rotationMatrix * vec4( 1.0, 0.0, 0.0, 1.0 ) ).xyz;
	rect.diry = ( rectAreaLight.rotationMatrix * vec4( 0.0, 1.0, 0.0, 1.0 ) ).xyz;

	vec3 rectNormal = cross( rect.dirx, rect.diry );
	rect.plane = vec4( rectNormal, -dot( rectNormal, rect.center ) );

	// Evaluate Lighting Equation
	vec3 spec = Rect_Area_Light_Specular_Reflectance( geometry, rect, roughness );
	vec3 diff = Rect_Area_Light_Diffuse_Reflectance( geometry, rect );

	// TODO (abelnation): note why division by 2PI is necessary
	reflectedLight.directSpecular += lightColor * matSpecColor * spec / PI2;
	reflectedLight.directDiffuse  += lightColor * matDiffColor * diff / PI2;

}

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = dotNL * directLight.color;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
#define RE_Area					RE_Area_BlinnPhong

#define Material_LightProbeLOD( material )	(0)
