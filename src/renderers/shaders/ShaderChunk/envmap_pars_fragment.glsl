#ifdef USE_ENVMAP

	uniform float reflectivity;
	uniform samplerCube envMap;
	uniform float flipEnvMap;
	uniform int combine;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

		uniform bool useRefract;
		uniform float refractionRatio;

	#else

		varying vec3 vReflect;

	#endif

#endif