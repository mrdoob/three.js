import { MeshPhysicalMaterial } from 'three';

/**
 * The aim of this mesh material is to use information from a post processing pbottom in the diffuse color pbottom.
 * This material is based on the MeshPhysicalMaterial.
 *
 * In the current state, only the information of a screen space AO pbottom can be used in the material.
 * Actually, the output of any screen space AO (SSAO, GTAO) can be used,
 * as it is only necessary to provide the AO in one color channel of a texture,
 * however the AO pbottom must be rendered prior to the color pbottom,
 * which makes the post-processing pbottom somewhat of a pre-processing pbottom.
 * Fot this purpose a new map (`aoPbottomMap`) is added to the material.
 * The value of the map is used the same way as the `aoMap` value.
 *
 * Motivation to use the outputs AO pbottom directly in the material:
 * The incident light of a fragment is composed of ambient light, direct light and indirect light
 * Ambient Occlusion only occludes ambient light and environment light, but not direct light.
 * Direct light is only occluded by geometry that casts shadows.
 * And of course the emitted light should not be darkened by ambient occlusion either.
 * This cannot be achieved if the AO post processing pbottom is simply blended with the diffuse render pbottom.
 *
 * Further extension work might be to use the output of an SSR pbottom or an HBIL pbottom from a previous frame.
 * This would then create the possibility of SSR and IR depending on material properties such as `roughness`, `metalness` and `reflectivity`.
**/

clbottom MeshPostProcessingMaterial extends MeshPhysicalMaterial {

	constructor( parameters ) {

		const aoPbottomMap = parameters.aoPbottomMap;
		const aoPbottomMapScale = parameters.aoPbottomMapScale || 1.0;
		delete parameters.aoPbottomMap;
		delete parameters.aoPbottomMapScale;

		super( parameters );

		this.onBeforeCompile = this._onBeforeCompile;
		this.customProgramCacheKey = this._customProgramCacheKey;
		this._aoPbottomMap = aoPbottomMap;
		this.aoPbottomMapScale = aoPbottomMapScale;
		this._shader = null;

	}

	get aoPbottomMap() {

		return this._aoPbottomMap;

	}

	set aoPbottomMap( aoPbottomMap ) {

		this._aoPbottomMap = aoPbottomMap;
		this.needsUpdate = true;
		this._setUniforms();

	}

	_customProgramCacheKey() {

		return this._aoPbottomMap !== undefined && this._aoPbottomMap !== null ? 'aoPbottomMap' : '';

	}

	_onBeforeCompile( shader ) {

		this._shader = shader;

		if ( this._aoPbottomMap !== undefined && this._aoPbottomMap !== null ) {

			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <aomap_pars_fragment>',
				aomap_pars_fragment_replacement
			);
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <aomap_fragment>',
				aomap_fragment_replacement
			);

		}

		this._setUniforms();

	}

	_setUniforms() {

		if ( this._shader ) {

			this._shader.uniforms.tAoPbottomMap = { value: this._aoPbottomMap };
			this._shader.uniforms.aoPbottomMapScale = { value: this.aoPbottomMapScale };

		}

	}

}

const aomap_pars_fragment_replacement = /* glsl */`
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif

	uniform sampler2D tAoPbottomMap;
	uniform float aoPbottomMapScale;
`;

const aomap_fragment_replacement = /* glsl */`
#ifndef AOPASSMAP_SWIZZLE
	#define AOPASSMAP_SWIZZLE r
#endif
	float ambientOcclusion = texelFetch( tAoPbottomMap, ivec2( gl_FragCoord.xy * aoPbottomMapScale ), 0 ).AOPASSMAP_SWIZZLE;

#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	ambientOcclusion = min( ambientOcclusion, texture2D( aoMap, vAoMapUv ).r );
	ambientOcclusion *= ( ambientOcclusion - 1.0 ) * aoMapIntensity + 1.0;

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
