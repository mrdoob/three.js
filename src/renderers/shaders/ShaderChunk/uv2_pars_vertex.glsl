#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP ) || defined( USE_DISPLACEMENTMAP )

	attribute vec2 uv2;

#endif

#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )

	varying vec2 vUv2;

#endif

