#ifdef USE_COLOR

#if defined(NEEDSGLSL300)
	in vec3 vColor;
#else
	varying vec3 vColor;
#endif
#endif
