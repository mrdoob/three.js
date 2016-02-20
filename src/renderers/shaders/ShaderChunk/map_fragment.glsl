#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	texelColor = EncodingToLinear( texelColor, mapEncoding );
	diffuseColor *= texelColor;

#endif
