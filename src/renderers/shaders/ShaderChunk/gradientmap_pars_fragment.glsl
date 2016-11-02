#ifdef USE_GRADIENTMAP

	uniform sampler2D gradientMap;

	vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {

		// dotNL will be from -1.0 to 1.0
		float dotNL = dot( normal, lightDirection );

		#ifdef GRADIENTMAP_AXIS_Y

			vec2 coord = vec2( 0.0, dotNL * 0.5 + 0.5 );

		#else

			vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );

		#endif

		return texture2D( gradientMap, coord ).rgb;

	}
#endif
