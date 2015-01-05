#ifdef USE_LIGHTMAP

	#ifdef LIGHTMAP_MULTIPLY

		gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );

	#endif

	#ifdef LIGHTMAP_MODULATE2X

		gl_FragColor = min( gl_FragColor * 2.0 * texture2D( lightMap, vUv2 ), 1.0 );

	#endif

#endif
