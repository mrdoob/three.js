#if NUM_CLIPPING_PLANES > 0

	#if ! defined( PHYSICAL ) && ! defined( PHONG )
	#if defined(NEEDSGLSL300)
		in vec3 vViewPosition;
        #else
		varying vec3 vViewPosition;
	#endif
	#endif

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

#endif
