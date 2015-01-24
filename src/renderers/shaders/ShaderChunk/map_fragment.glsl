#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	texelColor.xyz = inputToLinear( texelColor.xyz );

	gl_FragColor = gl_FragColor * texelColor;

#endif