#ifdef USE_ALPHAMAP

#if defined( TEXTURE_SLOTS )
	vec2 alphaUv = alphaMapUV();
#else
	vec2 alphaUv = vUv;
#endif

	diffuseColor.a *= alphaMapTexelTransform( texture2D( alphaMap, alphaUv ) ).g;

#endif
