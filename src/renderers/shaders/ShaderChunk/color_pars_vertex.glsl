#ifdef USE_COLOR
#if defined(NEEDSGLSL300)
	out vec3 vColor;
#else
	varying vec3 vColor;
#endif
#endif