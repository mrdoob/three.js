#ifdef USE_LIGHTMAP

	#if defined( PHONG )

		gl_FragColor += diffuseColor * texture2D( lightMap, vUv2 );

	#else 
		
		gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );

	#endif

#endif