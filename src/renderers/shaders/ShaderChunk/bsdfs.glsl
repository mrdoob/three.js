float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {

	if ( decayExponent > 0.0 ) {

	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

}


vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

	// factor of 1/PI in BRDF omitted as incoming light intensity is scaled up by PI because it is considered a punctual light source

	return diffuseColor;

} // validated


vec3 F_Schlick( const in vec3 specularColor, const in vec3 grazingColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	//;float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	float fresnel = exp2( ( -5.55437 * dotLH - 6.98316 ) * dotLH );

	return mix( specularColor, grazingColor, fresnel );

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
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in vec3 grazingColor, const in float roughness ) {
	
	// factor of 1/PI in BRDF omitted (normally it is in D_GGX) as incoming light intensity is scaled up by PI because it is considered a punctual light source

	float alpha = roughness * roughness; // UE4's roughness

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, grazingColor, dotLH );

	float G = G_GGX_Smith( alpha, dotNL, dotNV );

	float D = D_GGX( alpha, dotNH );

	return F * ( G * D );

} // validated


// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, vec3 specularColor, const in vec3 grazingColor, float roughness ) {

	float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;

	return specularColor * AB.x + AB.y * grazingColor;

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

	vec3 F = F_Schlick( specularColor, vec3( 1.0 ), dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated