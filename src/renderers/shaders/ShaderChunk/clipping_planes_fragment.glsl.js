export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	vec4 plane;

	#ifdef ALPHA_TO_COVERAGE

		float clipOpacity = 1.0;
		float globalIncludeClipOpacity = 0.0;
		float globalExcludeClipOpacity = 0.0;
		float localIncludeClipOpacity = 0.0;
		float localExcludeClipOpacity = 0.0;

		for ( int volumeIndex = 0; volumeIndex < NUM_CLIPPING_VOLUMES; volumeIndex ++ ) {

			if ( volumeIndex >= clippingNumVolumes ) continue;

			float volumeClipOpacity = 1.0;
			bool isGlobalVolume = volumeIndex < clippingNumGlobalVolumes;
			int planeStart = clippingVolumePlaneStart[ volumeIndex ];
			int planeEnd = planeStart + clippingVolumePlaneCount[ volumeIndex ];

			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_CLIPPING_PLANES; i ++ ) {

				if ( ( UNROLLED_LOOP_INDEX >= planeStart ) && ( UNROLLED_LOOP_INDEX < planeEnd ) ) {

					plane = clippingPlanes[ UNROLLED_LOOP_INDEX ];
					volumeClipOpacity *= clippingPlaneOpacity( plane );

				}

			}
			#pragma unroll_loop_end

			if ( clippingVolumeMode[ volumeIndex ] == 0 ) {

				if ( isGlobalVolume ) {

					globalIncludeClipOpacity = max( globalIncludeClipOpacity, volumeClipOpacity );

				} else {

					localIncludeClipOpacity = max( localIncludeClipOpacity, volumeClipOpacity );

				}

			} else {

				if ( isGlobalVolume ) {

					globalExcludeClipOpacity = max( globalExcludeClipOpacity, volumeClipOpacity );

				} else {

					localExcludeClipOpacity = max( localExcludeClipOpacity, volumeClipOpacity );

				}

			}

		}

		bool hasGlobalIncludeVolumes = clippingNumGlobalIncludeVolumes > 0;
		bool hasLocalIncludeVolumes = clippingNumLocalIncludeVolumes > 0;
		float globalClipOpacity = 1.0;
		float localClipOpacity = 1.0;

		if ( hasGlobalIncludeVolumes ) {

			globalClipOpacity *= globalIncludeClipOpacity;

		}

		globalClipOpacity *= 1.0 - globalExcludeClipOpacity;

		if ( hasLocalIncludeVolumes ) {

			localClipOpacity *= localIncludeClipOpacity;

		}

		localClipOpacity *= 1.0 - localExcludeClipOpacity;
		clipOpacity *= globalClipOpacity * localClipOpacity;
		diffuseColor.a *= clipOpacity;

		if ( diffuseColor.a == 0.0 ) discard;

	#else

		bool insideGlobalIncludeAny = false;
		bool insideGlobalExcludeAny = false;
		bool insideLocalIncludeAny = false;
		bool insideLocalExcludeAny = false;

		for ( int volumeIndex = 0; volumeIndex < NUM_CLIPPING_VOLUMES; volumeIndex ++ ) {

			if ( volumeIndex >= clippingNumVolumes ) continue;

			bool insideVolume = true;
			bool isExcludeVolume = clippingVolumeMode[ volumeIndex ] == 1;
			bool isGlobalVolume = volumeIndex < clippingNumGlobalVolumes;
			int planeStart = clippingVolumePlaneStart[ volumeIndex ];
			int planeEnd = planeStart + clippingVolumePlaneCount[ volumeIndex ];

			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_CLIPPING_PLANES; i ++ ) {

				if ( ( UNROLLED_LOOP_INDEX >= planeStart ) && ( UNROLLED_LOOP_INDEX < planeEnd ) ) {

					plane = clippingPlanes[ UNROLLED_LOOP_INDEX ];
					float planeDistance = dot( vClipPosition, plane.xyz );
					bool insidePlane = isExcludeVolume ? ( planeDistance < plane.w ) : ( planeDistance <= plane.w );
					insideVolume = insidePlane && insideVolume;

				}

			}
			#pragma unroll_loop_end

			if ( ! isExcludeVolume ) {

				if ( isGlobalVolume ) {

					insideGlobalIncludeAny = insideGlobalIncludeAny || insideVolume;

				} else {

					insideLocalIncludeAny = insideLocalIncludeAny || insideVolume;

				}

			} else {

				if ( isGlobalVolume ) {

					insideGlobalExcludeAny = insideGlobalExcludeAny || insideVolume;

				} else {

					insideLocalExcludeAny = insideLocalExcludeAny || insideVolume;

				}

			}

		}

		bool hasGlobalIncludeVolumes = clippingNumGlobalIncludeVolumes > 0;
		bool hasLocalIncludeVolumes = clippingNumLocalIncludeVolumes > 0;
		bool globalVisible = ( ! hasGlobalIncludeVolumes || insideGlobalIncludeAny ) && ! insideGlobalExcludeAny;
		bool localVisible = ( ! hasLocalIncludeVolumes || insideLocalIncludeAny ) && ! insideLocalExcludeAny;

		if ( ! globalVisible || ! localVisible ) discard;

	#endif

#endif
`;
