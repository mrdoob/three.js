export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	vec4 plane;

	float clippingPlaneOpacity( const in vec4 clippingPlane ) {

		float distanceToPlane = - dot( vClipPosition, clippingPlane.xyz ) + clippingPlane.w;
		float distanceGradient = fwidth( distanceToPlane ) / 2.0;
		return smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

	}

	#ifdef ALPHA_TO_COVERAGE

		float clipOpacity = 1.0;

		#if NUM_GLOBAL_CLIPPING_PLANES > 0

			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_GLOBAL_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				clipOpacity *= clippingPlaneOpacity( plane );

				if ( clipOpacity == 0.0 ) discard;

			}
			#pragma unroll_loop_end

		#endif

		float includeClipOpacity = 0.0;
		float excludeClipOpacity = 0.0;

		#if NUM_CLIPPING_VOLUMES > 0

			for ( int volumeIndex = 0; volumeIndex < NUM_CLIPPING_VOLUMES; volumeIndex ++ ) {

				if ( volumeIndex >= clippingNumVolumes ) continue;

				float volumeClipOpacity = 1.0;
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

					includeClipOpacity = max( includeClipOpacity, volumeClipOpacity );

				} else {

					excludeClipOpacity = max( excludeClipOpacity, volumeClipOpacity );

				}

			}

		#endif

		bool hasIncludeVolumes = clippingNumIncludeVolumes > 0;

		if ( hasIncludeVolumes ) {

			clipOpacity *= includeClipOpacity;

		}

		clipOpacity *= 1.0 - excludeClipOpacity;

		diffuseColor.a *= clipOpacity;

		if ( diffuseColor.a == 0.0 ) discard;

	#else

		#if NUM_GLOBAL_CLIPPING_PLANES > 0

			#pragma unroll_loop_start
			for ( int i = 0; i < NUM_GLOBAL_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;

			}
			#pragma unroll_loop_end

		#endif

		bool insideIncludeAny = false;
		bool insideExcludeAny = false;

		#if NUM_CLIPPING_VOLUMES > 0

			for ( int volumeIndex = 0; volumeIndex < NUM_CLIPPING_VOLUMES; volumeIndex ++ ) {

				if ( volumeIndex >= clippingNumVolumes ) continue;

				bool insideVolume = true;
				int planeStart = clippingVolumePlaneStart[ volumeIndex ];
				int planeEnd = planeStart + clippingVolumePlaneCount[ volumeIndex ];

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_CLIPPING_PLANES; i ++ ) {

					if ( ( UNROLLED_LOOP_INDEX >= planeStart ) && ( UNROLLED_LOOP_INDEX < planeEnd ) ) {

						plane = clippingPlanes[ UNROLLED_LOOP_INDEX ];
						insideVolume = ( dot( vClipPosition, plane.xyz ) <= plane.w ) && insideVolume;

					}

				}
				#pragma unroll_loop_end

				if ( clippingVolumeMode[ volumeIndex ] == 0 ) {

					insideIncludeAny = insideIncludeAny || insideVolume;

				} else {

					insideExcludeAny = insideExcludeAny || insideVolume;

				}

			}

		#endif

		bool hasIncludeVolumes = clippingNumIncludeVolumes > 0;

		if ( ( hasIncludeVolumes && ! insideIncludeAny ) || insideExcludeAny ) discard;

	#endif

#endif
`;
