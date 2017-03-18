#ifdef USE_MESHLINE

	uniform vec2 resolution;
	uniform float lineWidth;

	vec2 convertToNDC( vec4 clipCoords, float aspect ) {

		// the prespective divide does the acutal conversion

		vec2 ndcCoords = clipCoords.xy / clipCoords.w;

		// correct for aspect ratio

		ndcCoords.x *= aspect;

		return ndcCoords;

	}

#endif
