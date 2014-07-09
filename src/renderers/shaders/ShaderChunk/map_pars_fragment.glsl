#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )

	varying vec2 vUv;

#endif

#ifdef USE_MAP

	uniform sampler2D map;

#endif