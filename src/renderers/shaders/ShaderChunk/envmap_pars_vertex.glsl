#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )

	varying vec3 vReflect;

	uniform float refractionRatio;
	uniform bool useRefract;

#endif
