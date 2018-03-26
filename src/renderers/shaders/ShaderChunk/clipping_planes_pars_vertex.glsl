#if NUM_CLIPPING_PLANES > 0 && ! defined( PHYSICAL ) && ! defined( PHONG )
#if defined(NEEDSGLSL300)
	out vec3 vViewPosition;
#else
	varying vec3 vViewPosition;
#endif
#endif
