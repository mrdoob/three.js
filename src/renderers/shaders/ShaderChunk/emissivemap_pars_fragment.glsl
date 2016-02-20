#ifdef USE_EMISSIVEMAP

	uniform sampler2D emissiveMap;

	vec4 emissiveMapTexelToLinear( vec4 texel ) {
		#define DECODE_MACRO EMISSIVEMAP_ENCODING
			#include "encoding_template.glsl"
		#undef DECODE_MACRO
	}

#endif
