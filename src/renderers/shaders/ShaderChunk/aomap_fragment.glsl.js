export default /* glsl */`
#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

	reflectedLight.indirectDiffuse *= ambientOcclusion;

	#if defined( USE_ENVMAP ) && defined( STANDARD )

		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

		float specularOcclusion = computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );

		reflectedLight.indirectSpecular *= specularOcclusion;

		#if defined( USE_CLEARCOAT ) 
			clearcoatSpecularIndirect *= specularOcclusion;
		#endif


	#endif

#endif
`;
