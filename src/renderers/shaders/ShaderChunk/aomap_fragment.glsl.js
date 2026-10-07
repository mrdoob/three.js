export default /* glsl */`
#if defined( USE_AOMAP ) || defined( USE_SSAO_MAP )

	float ambientOcclusion = 1.0;

	#ifdef USE_AOMAP

		// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
		ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

	#endif

	#ifdef USE_SSAO_MAP

		// screen-space AO; the stronger occlusion of the per-object and screen-space maps wins
		ambientOcclusion = min( ambientOcclusion, texture2D( ssaoMap, gl_FragCoord.xy / vec2( textureSize( ssaoMap, 0 ) ) ).r );

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

#endif
`;
