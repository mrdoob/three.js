#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )

#if defined(NEEDSGLSL300)
	in vec2 uv2;
	out vec2 vUv2;
#else
	attribute vec2 uv2;
	varying vec2 vUv2;
#endif

#endif