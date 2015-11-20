#if defined( USE_ENVMAP ) || defined( STANDARD )
	uniform float reflectivity;
	uniform float envMapIntenstiy;
#endif

#ifdef USE_ENVMAP
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	uniform float flipEnvMap;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( STANDARD )

		uniform float refractionRatio;

	#else

		varying vec3 vReflect;

	#endif

#endif
