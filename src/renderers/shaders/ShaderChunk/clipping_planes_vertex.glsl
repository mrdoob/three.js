#if NUM_CLIPPING_PLANES > 0 && ! defined( STANDARD ) && ! defined( PHONG )
	vViewPosition = - mvPosition.xyz;
#endif

