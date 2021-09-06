import FunctionNode from '../core/FunctionNode.js';
import { pow2 } from './MathFunctions.js';

export const F_Schlick = new FunctionNode( `
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH  ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( -5.55473 * dotVH - 6.98316 ) * dotVH );

	return ( f90 - f0 ) * fresnel + f0;

}` ); // validated

export const G_BlinnPhong_Implicit = new FunctionNode( `
float G_BlinnPhong_Implicit() {

	// ( const in float dotNL, const in float dotNV )
	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)

	return 0.25;

}` ); // validated

export const BRDF_Lambert = new FunctionNode( `
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

}` ); // validated

export const getDistanceAttenuation = new FunctionNode( `
float getDistanceAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {

#if defined ( PHYSICALLY_CORRECT_LIGHTS )

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
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

}` ).setIncludes( [ pow2 ] );

//
// STANDARD
//

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
export const V_GGX_SmithCorrelated = new FunctionNode( `
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {

	float a2 = pow2( alpha );

	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );

	return 0.5 / max( gv + gl, EPSILON );

}` ).setIncludes( [ pow2 ] );

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
export const D_GGX = new FunctionNode( `
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}` ).setIncludes( [ pow2 ] );

// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
export const BRDF_Specular_GGX = new FunctionNode( `
vec3 BRDF_Specular_GGX( vec3 lightDirection, const in vec3 f0, const in float f90, const in float roughness ) {

	float alpha = pow2( roughness ); // UE4's roughness

	vec3 halfDir = normalize( lightDirection + PositionViewDirection );

	float dotNL = saturate( dot( TransformedNormalView, lightDirection ) );
	float dotNV = saturate( dot( TransformedNormalView, PositionViewDirection ) );
	float dotNH = saturate( dot( TransformedNormalView, halfDir ) );
	float dotVH = saturate( dot( PositionViewDirection, halfDir ) );

	vec3 F = F_Schlick( f0, f90, dotVH );

	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );

	float D = D_GGX( alpha, dotNH );

	return F * ( V * D );

}` ).setIncludes( [ pow2, F_Schlick, V_GGX_SmithCorrelated, D_GGX ] ); // validated

export const RE_Direct_Physical = new FunctionNode( `
void RE_Direct_Physical( inout ReflectedLight reflectedLight, vec3 lightDirection, vec3 lightColor ) {

	float dotNL = saturate( dot( TransformedNormalView, lightDirection ) );
	vec3 irradiance = dotNL * lightColor;

#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

#endif

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( MaterialDiffuseColor.rgb );

	reflectedLight.directSpecular += irradiance * BRDF_Specular_GGX( lightDirection, MaterialSpecularTint, 1.0, MaterialRoughness );

}` ).setIncludes( [ BRDF_Lambert, BRDF_Specular_GGX ] );

export const PhysicalLightingModel = new FunctionNode( `
void ( inout ReflectedLight reflectedLight, vec3 lightDirection, vec3 lightColor ) {

	RE_Direct_Physical( reflectedLight, lightDirection, lightColor );

}` ).setIncludes( [ RE_Direct_Physical ] );

// utils

// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
export const getSpecularMIPLevel = new FunctionNode( `
float ( const in float roughness, const in float maxMIPLevelScalar ) {

	float sigma = PI * roughness * roughness / ( 1.0 + roughness );
	float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

	// clamp to allowable LOD ranges.
	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

}` );
