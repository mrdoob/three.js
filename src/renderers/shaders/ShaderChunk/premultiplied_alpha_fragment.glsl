#ifdef PREMULTIPLIED_ALPHA

	// Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
#if defined(NEEDSGLSL300)
	glFragColor.rgb *= glFragColor.a;
#else
	gl_FragColor.rgb *= gl_FragColor.a;
#endif
#endif
