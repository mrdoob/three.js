#ifdef USE_ENVMAP

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )
		out vec3 vWorldPosition;

	#else

		out vec3 vReflect;
		uniform float refractionRatio;

	#endif

#endif
