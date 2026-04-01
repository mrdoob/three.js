export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	vec4 plane;

	#ifdef USE_CLIPPING_VOLUMES

		#ifdef ALPHA_TO_COVERAGE

			float distanceToPlane, distanceGradient;
			float clipOpacity = 1.0;

			#if NUM_GLOBAL_CLIPPING_PLANES > 0

				#pragma unroll_loop_start
				for ( int i = 0; i < NUM_GLOBAL_CLIPPING_PLANES; i ++ ) {

					plane = clippingPlanes[ i ];
					distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
					distanceGradient = fwidth( distanceToPlane ) / 2.0;
					clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

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
							distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
							distanceGradient = fwidth( distanceToPlane ) / 2.0;
							volumeClipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

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

	#else

		#ifdef ALPHA_TO_COVERAGE

			float distanceToPlane, distanceGradient;
			float clipOpacity = 1.0;

			#pragma unroll_loop_start
			for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

				if ( clipOpacity == 0.0 ) discard;

			}
			#pragma unroll_loop_end

			#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

				float unionClipOpacity = 1.0;

				#pragma unroll_loop_start
				for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

					plane = clippingPlanes[ i ];
					distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
					distanceGradient = fwidth( distanceToPlane ) / 2.0;
					unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

				}
				#pragma unroll_loop_end

				clipOpacity *= 1.0 - unionClipOpacity;

			#endif

			diffuseColor.a *= clipOpacity;

			if ( diffuseColor.a == 0.0 ) discard;

		#else

			#pragma unroll_loop_start
			for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;

			}
			#pragma unroll_loop_end

			#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

				bool clipped = true;

				#pragma unroll_loop_start
				for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

					plane = clippingPlanes[ i ];
					clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;

				}
				#pragma unroll_loop_end

				if ( clipped ) discard;

			#endif

		#endif

	#endif

#endif
`;
