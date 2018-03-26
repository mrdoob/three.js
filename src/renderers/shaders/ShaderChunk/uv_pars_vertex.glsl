#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )

#if defined(NEEDSGLSL300)
	out vec2 vUv;
#else
	varying vec2 vUv;
#endif
	uniform mat3 uvTransform;

#endif
