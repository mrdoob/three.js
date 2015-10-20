//#define ENERGY_PRESERVING_MONOCHROME

float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {

	if ( decayExponent > 0.0 ) {

	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

}


void BRDF_Lambert( const in IncidentLight incidentLight, const in GeometricContext geometryContext, const in vec3 diffuseColor, inout ReflectedLight reflectedLight ) {

	float lambertianReflectance = saturate( dot( geometryContext.normal, incidentLight.direction ) );

	#if defined( ENERGY_PRESERVING_MONOCHROME ) || defined( ENERGY_PRESERVING_RGB )

		lambertianReflectance *= RECIPROCAL_PI;

	#endif

	reflectedLight.diffuse += incidentLight.color * diffuseColor * lambertianReflectance;

}

void BRDF_OrenNayar( const in IncidentLight incidentLight, const in GeometricContext geometryContext, const in vec3 diffuse, const in float roughness, inout ReflectedLight reflectedLight ) {

	vec3 halfDir = normalize( incidentLight.direction + geometryContext.viewDir );
	float dotVH = saturate( dot( geometryContext.viewDir, halfDir ) );
	float dotNV = saturate( dot( geometryContext.normal, geometryContext.viewDir ) );
	float dotNL = saturate( dot( geometryContext.normal, incidentLight.direction ) );

	float m2 = roughness * roughness;
	float termA = 1.0 - 0.5 * m2 / (m2 + 0.33);
	float Cosri = 2.0 * dotVH - 1.0 - dotNV * dotNL;
	float termB = 0.45 * m2 / (m2 + 0.09) * Cosri * ( Cosri >= 0.0 ? min( 1.0, dotNL / dotNV ) : dotNL );

	reflectedLight.diffuse = incidentLight.color * diffuse * ( RECIPROCAL_PI * ( dotNL * termA + termB ) );

}

vec3 F_Schlick( const in vec3 F0, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	//;float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );

	return F0 + ( 1.0 - F0 ) * fresnel;

}

// Microfacet Models for Refraction through Rough Surfaces - equation (34)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float G_GGX_Smith( in float alpha, in float dotNL, in float dotNV ) {

	// geometry term = G(l) . G(v) / 4(n . l)(n. v)

	float a2 = alpha * alpha;

	float gl = dotNL + pow( a2 + ( 1.0 - a2 ) * dotNL * dotNL, 0.5 );

	float gv = dotNV + pow( a2 + ( 1.0 - a2 ) * dotNV * dotNV, 0.5 );

	return 1.0 / ( gl * gv );

}


// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( in float alpha, in float dotNH ) {

	// factor of 1/PI in distribution term omitted

	float a2 = alpha * alpha;

	float denom = dotNH * dotNH * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return a2 / ( denom * denom );

}

float G_BlinnPhong_Implicit( /* in float dotNL, in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

void BRDF_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness2, inout ReflectedLight reflectedLight ) {
	
	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );
	float G = G_SmithSchlick( roughness2, dotNL, dotNV );
	float D = D_GGX( roughness2, dotNH );

	reflectedLight.specular += incidentLight.color * F * ( G * D );

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	// factor of 1/PI in distribution term omitted ???
	return ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

void BRDF_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess, inout ReflectedLight reflectedLight ) {

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );
	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );
	float D = D_BlinnPhong( shininess, dotNH );

	reflectedLight.specular += incidentLight.color * F * ( G * D );

}

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 envBRDFApprox( vec3 specularColor, float roughness, in vec3 normal, in vec3 viewDir  ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

	return specularColor * AB.x + AB.y;

}