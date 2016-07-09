#if NUM_CLIPPING_PLANES > 0

	for ( int i = 0; i < NUM_CLIPPING_PLANES; ++ i ) {

		vec4 plane = clippingPlanes[ i ];
		if ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;

	}

#endif
