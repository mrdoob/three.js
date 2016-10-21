#ifdef USE_TOONMAP

	uniform sampler2D toonMap;

	vec3 getToonIrradiance( vec3 normal, vec3 lightDirection ) {

		// dotNL will be from -1.0 to 1.0
		float dotNL = dot( normal, lightDirection );

		#ifdef TOONMAP_DIRECTION_Y

			vec2 coord = vec2( 0.0, dotNL * 0.5 + 0.5 );

		#else

			vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );

		#endif

		return texture2D( toonMap, coord ).rgb;

	}
#endif
