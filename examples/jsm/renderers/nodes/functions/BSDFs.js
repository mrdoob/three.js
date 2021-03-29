import FunctionNode from '../core/FunctionNode.js';

export const F_Schlick = new FunctionNode( `
vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

}` ); // validated

export const G_BlinnPhong_Implicit = new FunctionNode( `
float G_BlinnPhong_Implicit() {

	// ( const in float dotNL, const in float dotNV )
	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)

	return 0.25;

}` ); // validated

export const D_BlinnPhong = new FunctionNode( `
float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}` ); // validated

export const BRDF_Diffuse_Lambert = new FunctionNode( `
vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

}` ); // validated

export const BRDF_Specular_BlinnPhong = new FunctionNode( `
vec3 BRDF_Specular_BlinnPhong( vec3 lightDirection, vec3 specularColor, float shininess ) {

	vec3 halfDir = normalize( lightDirection + PositionViewDirection );

	//float dotNL = saturate( dot( NormalView, lightDirection ) );
	//float dotNV = saturate( dot( NormalView, PositionViewDirection ) );
	float dotNH = saturate( dot( NormalView, halfDir ) );
	float dotLH = saturate( dot( lightDirection, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

}` ).setIncludes( [ F_Schlick, G_BlinnPhong_Implicit, D_BlinnPhong ] ); // validated

export const punctualLightIntensityToIrradianceFactor = new FunctionNode( `
float punctualLightIntensityToIrradianceFactor( float lightDistance, float cutoffDistance, float decayExponent ) {

#if defined ( PHYSICALLY_CORRECT_LIGHTS )

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	// this is intended to be used on spot and point lights who are represented as luminous intensity
	// but who must be converted to luminous irradiance for surface lighting calculation
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

	if( cutoffDistance > 0.0 ) {

		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

	}

	return distanceFalloff;

#else

	if( cutoffDistance > 0.0 && decayExponent > 0.0 ) {

		return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

#endif

}` );

export const RE_Direct_BlinnPhong = new FunctionNode( `
void RE_Direct_BlinnPhong( vec3 lightDirection, vec3 lightColor ) {

	float dotNL = saturate( dot( NormalView, lightDirection ) );
	vec3 irradiance = dotNL * lightColor;

#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

#endif

	ReflectedLightDirectDiffuse += irradiance * BRDF_Diffuse_Lambert( MaterialDiffuseColor.rgb );

	ReflectedLightDirectSpecular += irradiance * BRDF_Specular_BlinnPhong( lightDirection, MaterialSpecularColor, MaterialSpecularShininess );

}` ).setIncludes( [ BRDF_Diffuse_Lambert, BRDF_Specular_BlinnPhong ] );

export const RE_IndirectDiffuse_BlinnPhong = new FunctionNode( `
void RE_IndirectDiffuse_BlinnPhong( ) {

	ReflectedLightIndirectDiffuse += Irradiance * BRDF_Diffuse_Lambert( MaterialDiffuseColor.rgb );

}` ).setIncludes( [ BRDF_Diffuse_Lambert ] );
