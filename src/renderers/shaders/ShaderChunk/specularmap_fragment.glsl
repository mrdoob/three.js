float specularStrength;

#ifdef USE_SPECULARMAP

	#if defined( TEXTURE_SLOTS )
		vec2 specularUv = specularMapUV();
	#else
		vec2 specularUv = vUv;
	#endif

	vec4 texelSpecular = specularMapTexelTransform( texture2D( specularMap, specularUv ) );
	specularStrength = texelSpecular.r;

#else

	specularStrength = 1.0;

#endif
