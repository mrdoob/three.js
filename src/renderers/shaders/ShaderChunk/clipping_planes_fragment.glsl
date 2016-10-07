#if NUM_CLIPPING_PLANES > 0

	#if CLIP_INTERSECTION

		bool clipped = true;
		for ( int i = 0; i < NUM_CLIPPING_PLANES; ++ i ) {
			vec4 plane = clippingPlanes[ i ];
			clipped = ( dot( vViewPosition, plane.xyz ) > plane.w ) && clipped;
		}

		if ( clipped ) discard;

	#else

		for ( int i = 0; i < NUM_CLIPPING_PLANES; ++ i ) {

			vec4 plane = clippingPlanes[ i ];
			if ( dot( vViewPosition, plane.xyz ) > plane.w ) discard;

		}
		
	#endif

#endif
