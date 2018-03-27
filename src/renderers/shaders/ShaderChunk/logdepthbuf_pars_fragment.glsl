#ifdef USE_LOGDEPTHBUF

	uniform float logDepthBufFC;

	#ifdef USE_LOGDEPTHBUF_EXT

	#if defined(NEEDSGLSL300)
		in float vFragDepth;
	#else
		varying float vFragDepth;
	#endif

	#endif

#endif
