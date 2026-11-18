export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )

		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )

			irradiance += getIBLIrradiance( geometryNormal );

		#endif

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	#ifdef USE_ANISOTROPY

		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );

	#else

		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );

	#endif

	// Normal maps can bend the reflection below the surface, which occludes it.
	// The face normal follows vertex displacement, the vertex normal follows smooth low-poly surfaces.
	vec3 faceNormal = normalize( cross( dFdx( vViewPosition ), dFdy( vViewPosition ) ) );

	vec3 horizonVec = reflect( - geometryViewDir, geometryNormal );
	float horizon = min( 1.0 + max( dot( horizonVec, nonPerturbedNormal ), dot( horizonVec, faceNormal ) ), 1.0 );
	iblRadiance *= horizon * horizon;

	#ifdef USE_RETROREFLECTION

		#ifdef USE_ANISOTROPY

			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );

		#else

			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );

		#endif

		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );

	#endif

	radiance += iblRadiance;

	#ifdef USE_CLEARCOAT

		vec3 clearcoatHorizonVec = reflect( - geometryViewDir, geometryClearcoatNormal );
		float clearcoatHorizon = min( 1.0 + max( dot( clearcoatHorizonVec, nonPerturbedNormal ), dot( clearcoatHorizonVec, faceNormal ) ), 1.0 );

		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness ) * clearcoatHorizon * clearcoatHorizon;

	#endif

#endif
`;
