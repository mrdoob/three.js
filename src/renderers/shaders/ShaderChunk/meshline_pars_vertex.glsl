#ifdef USE_MESHLINE

	uniform float lineWidth;
	uniform float sizeAttenuation;
	uniform vec2 resolution;

	vec2 convertToNDC( vec4 clipCoords, float aspect ) {

		// the prespective divide does the actual conversion

		vec2 ndcCoords = clipCoords.xy / clipCoords.w;

		// correct for aspect ratio

		ndcCoords.x *= aspect;

		return ndcCoords;

	}

#endif
