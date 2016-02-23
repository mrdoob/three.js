#ifdef USE_EMISSIVEMAP

	uniform sampler2D emissiveMap;

	vec4 emissiveMapTexelToLinear( vec4 value ) {
		#define MACRO_DECODE EMISSIVEMAP_ENCODING
			#include <encoding_template>
		#undef MACRO_DECODE
	}

#endif
