#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )
	vViewPosition = - mvPosition.xyz;
#endif

