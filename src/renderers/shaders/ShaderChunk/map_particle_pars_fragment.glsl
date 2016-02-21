#ifdef USE_MAP

	uniform vec4 offsetRepeat;
	uniform sampler2D map;
	
	vec4 mapTexelToLinear( vec4 value ) {
		#define MACRO_DECODE MAP_ENCODING
			#include <encoding_template>
		#undef MACRO_DECODE
	}

#endif
