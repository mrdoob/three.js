#ifdef USE_LOGDEPTHBUF

	gl_Position.z = log2(max(1e-6, gl_Position.w + 1.0)) * logDepthBufFC;

	#ifdef USE_LOGDEPTHBUF_EXT

		vFragDepth = 1.0 + gl_Position.w;

#else

		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;

	#endif

#endif