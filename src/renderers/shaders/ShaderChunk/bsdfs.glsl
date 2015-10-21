//#define ENERGY_PRESERVING_MONOCHROME

#define DIELECTRIC_SPECULAR_F0 0.20

float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {

	if ( decayExponent > 0.0 ) {

	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

}


ReflectedLight BRDF_Mix( const in ReflectedLight base, const in ReflectedLight over, const in float weight ) {
	return ReflectedLight(
		mix( base.diffuse, over.diffuse, weight ),
		mix( base.specular, over.specular, weight )
	);
}

ReflectedLight BRDF_Add( const in ReflectedLight base, const in ReflectedLight over, const in float weight ) {
	return ReflectedLight(
		base.diffuse + over.diffuse,
		base.specular + over.specular 
	);
}

vec3 BRDF_Diffuse_Lambert( const in IncidentLight incidentLight, const in GeometricContext geometryContext, const in vec3 diffuseColor ) {

	// factor of 1/PI in BRDF omitted as incoming light intensity is scaled up by PI because it is considered a punctual light source

	return diffuseColor;

} // validated

// this roughness is a different property than specular roughness used in GGX.
vec3 BRDF_Diffuse_OrenNayar( const in IncidentLight incidentLight, const in GeometricContext geometryContext, const in vec3 diffuseColor, const in float roughness ) {

	vec3 halfDir = normalize( incidentLight.direction + geometryContext.viewDir );
	float dotVH = saturate( dot( geometryContext.viewDir, halfDir ) );
	float dotNV = saturate( dot( geometryContext.normal, geometryContext.viewDir ) );
	float dotNL = saturate( dot( geometryContext.normal, incidentLight.direction ) );

	float m2 = roughness * roughness;
	float termA = 1.0 - 0.5 * m2 / (m2 + 0.33);
	float Cosri = 2.0 * dotVH - 1.0 - dotNV * dotNL;
	float termB = 0.45 * m2 / (m2 + 0.09) * Cosri * ( Cosri >= 0.0 ? min( 1.0, dotNL / dotNV ) : dotNL );

	return diffuseColor * ( dotNL * termA + termB );

}

vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	//;float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

} // validated

// Microfacet Models for Refraction through Rough Surfaces - equation (34)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float G_GGX_Smith( in float alpha, in float dotNL, in float dotNV ) {

	// geometry term = G(l)⋅G(v) / 4(n⋅l)(n⋅v)

	float a2 = alpha * alpha;

	float gl = dotNL + pow( a2 + ( 1.0 - a2 ) * dotNL * dotNL, 0.5 );

	float gv = dotNV + pow( a2 + ( 1.0 - a2 ) * dotNV * dotNV, 0.5 );

	return 1.0 / ( gl * gv );

} // validated


// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( in float alpha, in float dotNH ) {

	// factor of 1/PI in distribution term omitted as incoming light intensity is scaled up by PI because it is considered a punctual light source

	float a2 = alpha * alpha;

	float denom = dotNH * dotNH * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return a2 / ( denom * denom );

}

// GGX Distribution, Schlick Fresnel, GGX-Smith Visibility
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
	
	// factor of 1/PI in BRDF omitted (normally it is in D_GGX) as incoming light intensity is scaled up by PI because it is considered a punctual light source

	float alpha = roughness * roughness; // UE4's roughness

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_GGX_Smith( alpha, dotNL, dotNV );

	float D = D_GGX( alpha, dotNH );

	return F * ( G * D );

} // validated

// useful for clear coat surfaces, use with Distribution_GGX.
float G_Kelemen( float vDotH ) {

	return 1.0 / ( 4.0 * vDotH * vDotH + 0.0000001 );

}

#define DIELECTRIC_SPECULAR_F0 0.20

// this blends the existing reflected light with a clear coat.
vec3 BRDF_Specular_ClearCoat( const in IncidentLight incidentLight, const in GeometricContext geometry, const in float clearCoatWeight, const in float clearCoatRoughness ) {

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	vec3 F = F_Schlick( vec3( DIELECTRIC_SPECULAR_F0 ), dotLH );
	float G = G_Kelemen( dotNV );
	float D = D_GGX( clearCoatRoughness, dotNH );

	
	return F * ( G * D );

}

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 BRDF_Specular_GGX_Environment( const in IncidentLight incidentLight, const in GeometricContext geometry, vec3 specularColor, float roughness ) {

	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

	return specularColor * AB.x + AB.y;

} // validated


float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	// factor of 1/PI in distribution term omitted as incoming light intensity is scaled up by PI because it is considered a punctual light source

	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {

	// factor of 1/PI in BRDF omitted (normally it is in D_BlinnPhong) as incoming light intensity is scaled up by PI because it is considered a punctual light source

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated