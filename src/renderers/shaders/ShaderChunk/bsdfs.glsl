//#define ENERGY_PRESERVING_MONOCHROME


struct IncidentLight {
 	vec3 color;
 	vec3 direction;
};

struct ReflectedLight {
 	vec3 specular;
 	vec3 diffuse;
};

struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
};


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

float G_SmithSchlick( float roughness2, float dotNL, float dotNV ) {

	float termL = ( dotNL + sqrt( roughness2 + ( 1.0 - roughness2 ) * square( dotNL ) ) );
	float termV = ( dotNV + sqrt( roughness2 + ( 1.0 - roughness2 ) * square( dotNV ) ) );
	
	return 1.0 / ( abs( termL * termV ) + 0.0000001 );

}

float D_GGX( float roughness2, float dotNH ) {

	// should 1/PI be in this distribution?
	float denom = square( dotNH ) * ( roughness2 - 1.0 ) + 1.0;
	return roughness2 / ( PI * square( denom ) + 0.0000001 );

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
