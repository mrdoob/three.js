#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	#ifdef GAMMA_INPUT

		texelColor.rgb *= texelColor.rgb;

	#endif

	diffuseColor.rgb *= texelColor.rgb;

#endif