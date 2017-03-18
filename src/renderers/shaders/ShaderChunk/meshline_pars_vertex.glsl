#ifdef USE_MESHLINE

	uniform vec2 resolution;
	uniform float lineWidth;

	vec2 convertToNDC( vec4 coord, float aspect ) {

		vec2 ndc = coord.xy / coord.w;
		ndc.x *= aspect;
		return ndc;

	}

#endif
