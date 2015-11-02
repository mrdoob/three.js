#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	texelColor.xyz = inputToLinear( texelColor.xyz );

	diffuseColor *= texelColor;

#endif
