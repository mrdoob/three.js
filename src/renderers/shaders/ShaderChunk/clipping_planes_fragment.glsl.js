export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	vec4 plane;
	int volumeState;
	bool isVolumeEnd;
	float volumeClipOpacity = 1.0;
	float planeClipOpacity;
	float globalIncludeClipOpacity = 0.0;
	float globalExcludeClipOpacity = 0.0;
	float localIncludeClipOpacity = 0.0;
	float localExcludeClipOpacity = 0.0;
	float clipOpacity;

	#ifndef ALPHA_TO_COVERAGE

		float planeDistance;
		bool isExcludeVolume;
		bool insidePlane;

	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_CLIPPING_PLANES; i ++ ) {

		plane = clippingPlanes[ UNROLLED_LOOP_INDEX ];

		volumeState = clippingPlaneVolumeState[ UNROLLED_LOOP_INDEX ];
		isVolumeEnd = volumeState >= CLIPPING_PLANE_VOLUME_END;

		if ( isVolumeEnd ) volumeState -= CLIPPING_PLANE_VOLUME_END;

		#ifdef ALPHA_TO_COVERAGE

			planeClipOpacity = clippingPlaneOpacity( plane );

		#else

			planeDistance = dot( vClipPosition, plane.xyz );
			isExcludeVolume = volumeState == CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE || volumeState == CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE;
			insidePlane = isExcludeVolume ? ( planeDistance < plane.w ) : ( planeDistance <= plane.w );
			planeClipOpacity = insidePlane ? 1.0 : 0.0;

		#endif

		volumeClipOpacity *= planeClipOpacity;

		if ( isVolumeEnd ) {

			if ( volumeState == CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE ) {

				globalIncludeClipOpacity = max( globalIncludeClipOpacity, volumeClipOpacity );

			} else if ( volumeState == CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE ) {

				globalExcludeClipOpacity = max( globalExcludeClipOpacity, volumeClipOpacity );

			} else if ( volumeState == CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE ) {

				localIncludeClipOpacity = max( localIncludeClipOpacity, volumeClipOpacity );

			} else {

				localExcludeClipOpacity = max( localExcludeClipOpacity, volumeClipOpacity );

			}

			volumeClipOpacity = 1.0;

		}

	}
	#pragma unroll_loop_end

	clipOpacity = ( clippingNumGlobalIncludeVolumes > 0 ? globalIncludeClipOpacity : 1.0 ) * ( 1.0 - globalExcludeClipOpacity );
	clipOpacity *= ( clippingNumLocalIncludeVolumes > 0 ? localIncludeClipOpacity : 1.0 ) * ( 1.0 - localExcludeClipOpacity );

	#ifdef ALPHA_TO_COVERAGE

		diffuseColor.a *= clipOpacity;

		if ( diffuseColor.a == 0.0 ) discard;

	#else

		if ( clipOpacity == 0.0 ) discard;

	#endif

#endif
`;
