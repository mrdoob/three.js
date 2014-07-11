#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	#ifdef GAMMA_INPUT

		texelColor.xyz *= texelColor.xyz;

	#endif

	gl_FragColor = gl_FragColor * texelColor;

#endif