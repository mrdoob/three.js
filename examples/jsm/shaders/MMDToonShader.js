/**
 * MMD Toon Shader
 *
 * This shader is extended from MeshPhongMaterial, and merged algorithms with
 * MeshToonMaterial and MeshMetcapMaterial.
 * Ideas came from https://github.com/mrdoob/three.js/issues/19609
 *
 * Combining steps:
 *  * Declare matcap uniform.
 *  * Add gradientmap_pars_fragment.
 *  * Use gradient irradiances instead of dotNL irradiance from MeshPhongMaterial.
 *    (Replace lights_phong_pars_fragment with lights_mmd_toon_pars_fragment)
 *  * Add mmd_toon_matcap_fragment.
 */

import { UniformsUtils, ShaderLib } from 'three';

const lights_mmd_toon_pars_fragment = /* glsl */`
varying vec3 vViewPosition;

struct BlinnPhongMaterial {

	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;

};

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );

	vec3 F = F_Schlick( specularColor, 1.0, dotVH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
`;

const mmd_toon_matcap_fragment = /* glsl */`
#ifdef USE_MATCAP

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
	vec4 matcapColor = texture2D( matcap, uv );

	#ifdef MATCAP_BLENDING_MULTIPLY

		outgoingLight *= matcapColor.rgb;

	#elif defined( MATCAP_BLENDING_ADD )

		outgoingLight += matcapColor.rgb;

	#endif

#endif
`;

const MMDToonShader = {

	defines: {
		TOON: true,
		MATCAP: true,
		MATCAP_BLENDING_ADD: true,
	},

	uniforms: UniformsUtils.merge( [
		ShaderLib.toon.uniforms,
		ShaderLib.phong.uniforms,
		ShaderLib.matcap.uniforms,
	] ),

	vertexShader:
		ShaderLib.phong.vertexShader
			.replace(
				'#include <envmap_pars_vertex>',
				''
			)
			.replace(
				'#include <envmap_vertex>',
				''
			),

	fragmentShader:
		ShaderLib.phong.fragmentShader
			.replace(
				'#include <common>',
				`
					#ifdef USE_MATCAP
						uniform sampler2D matcap;
					#endif

					#include <common>
				`
			)
			.replace(
				'#include <envmap_common_pars_fragment>',
				`
					#include <gradientmap_pars_fragment>
				`
			)
			.replace(
				'#include <envmap_pars_fragment>',
				''
			)
			.replace(
				'#include <lights_phong_pars_fragment>',
				lights_mmd_toon_pars_fragment
			)
			.replace(
				'#include <envmap_fragment>',
				`
					${mmd_toon_matcap_fragment}
				`
			)

};

export { MMDToonShader };
