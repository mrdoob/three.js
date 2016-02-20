#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	texelColor = texelDecode( texelColor, mapEncoding );
	diffuseColor *= texelColor;

#endif
