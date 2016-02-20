#ifdef USE_MAP

	uniform sampler2D map;

	vec4 mapTexelToLinear( vec4 texel ) {
		#define DECODE_MACRO MAP_ENCODING
			#include "encoding_template.glsl"
		#undef DECODE_MACRO
	}

#endif
