#if ! defined( TEXTURE_SLOTS )
	#ifdef USE_LIGHTMAP

		uniform sampler2D lightMap;
		uniform float lightMapIntensity;

	#endif
#endif
