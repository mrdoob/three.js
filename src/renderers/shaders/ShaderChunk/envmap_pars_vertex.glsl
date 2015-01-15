#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )

	varying vec3 vReflect;

	uniform float refractionRatio;

#endif
