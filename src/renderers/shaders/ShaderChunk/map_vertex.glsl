#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )

	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;

#endif