#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )

	vec3 worldNormal = transformDirection( objectNormal, modelMatrix );

	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );

	#ifdef ENVMAP_MODE_REFLECTION

		vReflect = reflect( cameraToVertex, worldNormal );

	#else

		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );

	#endif

#endif
