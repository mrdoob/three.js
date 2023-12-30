import { MeshPhysicalMaterial } from 'three';

/**
 * The aim of this mesh material is to use information from a post processing pass in the diffuse color pass.
 * This material is based on the MeshPhysicalMaterial.
 *
 * In the current state, only the information of a screen space AO pass can be used in the material.
 * Actually, the output of any screen space AO (SSAO, GTAO) can be used,
 * as it is only necessary to provide the AO in one color channel of a texture,
 * however the AO pass must be rendered prior to the color pass,
 * which makes the post-processing pass somewhat of a pre-processing pass.
 * Fot this purpose a new map (`aoPassMap`) is added to the material.
 * The value of the map is used the same way as the `aoMap` value.
 *
 * Motivation to use the outputs AO pass directly in the material:
 * The incident light of a fragment is composed of ambient light, direct light and indirect light
 * Ambient Occlusion only occludes ambient light and environment light, but not direct light.
 * Direct light is only occluded by geometry that casts shadows.
 * And of course the emitted light should not be darkened by ambient occlusion either.
 * This cannot be achieved if the AO post processing pass is simply blended with the diffuse render pass.
 *
 * Further extension work might be to use the output of an SSR pass or an HBIL pass from a previous frame.
 * This would then create the possibility of SSR and IR depending on material properties such as `roughness`, `metalness` and `reflectivity`.
**/

class MeshPostProcessingMaterial extends MeshPhysicalMaterial {

	constructor( parameters ) {

		const aoPassMap = parameters.aoPassMap;
		delete parameters.aoPassMap;
		super( parameters );

		this.onBeforeCompile = this._onBeforeCompile;
		this._aoPassMap = aoPassMap;

	}

	get aoPassMap() {

		return this._aoPassMap;

	}

	set aoPassMap( aoPassMap ) {

		this._aoPassMap = aoPassMap;
		this.needsUpdate = true;

	}

	_onBeforeCompile( shader ) {

		if ( this._aoPassMap !== undefined ) {

			shader.vertexShader = shader.vertexShader.replace(
				'#include <common>',
				`varying vec4 vClipSpacePosition;
                #include <common>`
			);
			shader.vertexShader = shader.vertexShader.replace(
				'#include <fog_vertex>',
				`#include <fog_vertex>
                vClipSpacePosition = gl_Position;`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <common>',
				`varying vec4 vClipSpacePosition;
				uniform sampler2D tAoPassMap;
                #include <common>`
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <aomap_fragment>',
				aomap_fragment_replacement
			);
			shader.uniforms.tAoPassMap = { value: this._aoPassMap };

		}

	}

}

const aomap_fragment_replacement = /* glsl */`
#ifndef AOPASSMAP_SWIZZLE
	#define AOPASSMAP_SWIZZLE r
#endif
	float ambientOcclusion = texture2D( tAoPassMap, vClipSpacePosition.xy / vClipSpacePosition.w * 0.5 + 0.5 ).AOPASSMAP_SWIZZLE;

#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	ambientOcclusion *= ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

#endif

	reflectedLight.indirectDiffuse *= ambientOcclusion;

	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD )

		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );

	#endif
`;

export { MeshPostProcessingMaterial };
