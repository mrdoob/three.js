#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG ) && ! defined( TOON )
	vViewPosition = - mvPosition.xyz;
#endif

