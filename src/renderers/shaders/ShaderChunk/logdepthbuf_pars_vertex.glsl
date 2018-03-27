#ifdef USE_LOGDEPTHBUF

	#ifdef USE_LOGDEPTHBUF_EXT

	#if defined(NEEDSGLSL300)
		out float vFragDepth;
	#else
		varying float vFragDepth;
	#endif

	#endif

	uniform float logDepthBufFC;

#endif