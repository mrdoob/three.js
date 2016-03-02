#ifdef USE_MAP

#if defined( TEXTURE_SLOTS )
	vec2 mapUv = mapUV();
#else
	vec2 mapUv = vUv;
#endif

	vec4 texelColor = texture2D( map, mapUv );

	texelColor = mapTexelTransform( mapTexelToLinear( texelColor ) );
	diffuseColor *= texelColor;

#endif
