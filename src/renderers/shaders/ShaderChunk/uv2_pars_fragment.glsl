#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
#if defined(NEEDSGLSL300)
	in vec2 vUv2;
#else
	varying vec2 vUv2;
#endif

#endif