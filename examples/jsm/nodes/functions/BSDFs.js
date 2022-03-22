import { ShaderNode,
	add, addTo, sub, mul, div, saturate, dot, pow, pow2, exp2, normalize, max, sqrt, negate,
	cond, greaterThan, and,
	transformedNormalView, positionViewDirection,
	diffuseColor, specularColor, roughness,
	EPSILON
} from '../ShaderNode.js';

export const F_Schlick = new ShaderNode( ( inputs ) => {

	const { f0, f90, dotVH } = inputs;

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	const fresnel = exp2( mul( sub( mul( - 5.55473, dotVH ), 6.98316 ), dotVH ) );

	return add( mul( f0, sub( 1.0, fresnel ) ), mul( f90, fresnel ) );

} ); // validated

export const BRDF_Lambert = new ShaderNode( ( inputs ) => {

	return mul( 1 / Math.PI, inputs.diffuseColor ); // punctual light

} ); // validated

export const getDistanceAttenuation = new ShaderNode( ( inputs ) => {

	const { lightDistance, cutoffDistance, decayExponent } = inputs;

	return cond(
		and( greaterThan( cutoffDistance, 0 ), greaterThan( decayExponent, 0 ) ),
		pow( saturate( add( div( negate( lightDistance ), cutoffDistance ), 1.0 ) ), decayExponent ),
		1.0
	);

} ); // validated

//
// STANDARD
//

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
export const V_GGX_SmithCorrelated = new ShaderNode( ( inputs ) => {

	const { alpha, dotNL, dotNV } = inputs;

	const a2 = pow2( alpha );

	const gv = mul( dotNL, sqrt( add( a2, mul( sub( 1.0, a2 ), pow2( dotNV ) ) ) ) );
	const gl = mul( dotNV, sqrt( add( a2, mul( sub( 1.0, a2 ), pow2( dotNL ) ) ) ) );

	return div( 0.5, max( add( gv, gl ), EPSILON ) );

} ); // validated

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
export const D_GGX = new ShaderNode( ( inputs ) => {

	const { alpha, dotNH } = inputs;

	const a2 = pow2( alpha );

	const denom = add( mul( pow2( dotNH ), sub( a2, 1.0 ) ), 1.0 ); // avoid alpha = 0 with dotNH = 1

	return mul( 1 / Math.PI, div( a2, pow2( denom ) ) );

} ); // validated


// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
export const BRDF_GGX = new ShaderNode( ( inputs ) => {

	const { lightDirection, f0, f90, roughness } = inputs;

	const alpha = pow2( roughness ); // UE4's roughness

	const halfDir = normalize( add( lightDirection, positionViewDirection ) );

	const dotNL = saturate( dot( transformedNormalView, lightDirection ) );
	const dotNV = saturate( dot( transformedNormalView, positionViewDirection ) );
	const dotNH = saturate( dot( transformedNormalView, halfDir ) );
	const dotVH = saturate( dot( positionViewDirection, halfDir ) );

	const F = F_Schlick( { f0, f90, dotVH } );

	const V = V_GGX_SmithCorrelated( { alpha, dotNL, dotNV } );

	const D = D_GGX( { alpha, dotNH } );

	return mul( F, mul( V, D ) );

} ); // validated

export const RE_Direct_Physical = new ShaderNode( ( inputs ) => {

	const { lightDirection, lightColor, directDiffuse, directSpecular } = inputs;

	const dotNL = saturate( dot( transformedNormalView, lightDirection ) );
	let irradiance = mul( dotNL, lightColor );

	irradiance = mul( irradiance, Math.PI ); // punctual light

	addTo( directDiffuse, mul( irradiance, BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

	addTo( directSpecular, mul( irradiance, BRDF_GGX( { lightDirection, f0: specularColor, f90: 1, roughness } ) ) );

} );

export const PhysicalLightingModel = new ShaderNode( ( inputs/*, builder*/ ) => {

	// PHYSICALLY_CORRECT_LIGHTS <-> builder.renderer.physicallyCorrectLights === true

	RE_Direct_Physical( inputs );

} );
