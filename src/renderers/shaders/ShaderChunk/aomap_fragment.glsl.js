export default /* glsl */`
#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

	// Use multi-bounce AO for diffuse to add energy back
	vec3 aoFactor = computeMultiBounceAO( ambientOcclusion, material.diffuseColor );
	reflectedLight.indirectDiffuse *= aoFactor;

	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD )

		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

		// Use improved specular occlusion with horizon fading
		reflectedLight.indirectSpecular *= computeSpecularOcclusionImproved( dotNV, ambientOcclusion, material.roughness );

	#endif

#endif
`;
