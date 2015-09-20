#ifdef USE_SHADOWMAP

	#ifdef SHADOWMAP_DEBUG

		vec3 frustumColors[3];
		frustumColors[0] = vec3( 1.0, 0.5, 0.0 );
		frustumColors[1] = vec3( 0.0, 1.0, 0.8 );
		frustumColors[2] = vec3( 0.0, 0.5, 1.0 );

	#endif

	float fDepth;
	vec3 shadowColor = vec3( 1.0 );

	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

		// to save on uniform space, we use the sign of @shadowDarkness[ i ] to determine
		// whether or not this light is a point light ( shadowDarkness[ i ] < 0 == point light)
		bool isPointLight = shadowDarkness[ i ] < 0.0;

		// get the real shadow darkness
		float realShadowDarkness = abs( shadowDarkness[ i ] );

		// for point lights, the uniform @vShadowCoord is re-purposed to hold
		// the distance from the light to the world-space position of the fragment.
		vec3 lightToPosition = vShadowCoord[ i ].xyz;

		float texelSizeX =  1.0 / shadowMapSize[ i ].x;
		float texelSizeY =  1.0 / shadowMapSize[ i ].y;

		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;
		float shadow = 0.0;

		// if ( something && something ) breaks ATI OpenGL shader compiler
		// if ( all( something, something ) ) using this instead

		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );

		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

		bool frustumTest = all( frustumTestVec );

		if ( frustumTest || isPointLight ) {

			shadowCoord.z += shadowBias[ i ];

			#if defined( SHADOWMAP_TYPE_PCF )

				#if defined(POINT_LIGHT_SHADOWS)

					if( isPointLight ) {

						float cubeTexelSize = 1.0 / ( shadowMapSize[ i ].x * 0.25 );
						vec3 baseDirection3D = normalize( lightToPosition );
						vec2 baseDirection2D = cubeToUV( baseDirection3D, texelSizeX, texelSizeY );

						initGridSamplingDisk();

						float diskRadius = 1.25;
						float numSamples = 1.0;
						shadow = 0.0;

						vec3 baseDirection = normalize( lightToPosition );
						float curDistance = length( lightToPosition );

						float dist = unpack1K( texture2D( shadowMap[ i ],  baseDirection2D ) ) + 0.1;
						if ( curDistance >= dist )
							shadow += 1.0;
						
						// evaluate each sampling direction
						for( int s = 0; s < 20; s++ ) {
						 
							vec3 offset = gridSamplingDisk[ s ] * diskRadius * cubeTexelSize;
							vec3 adjustedBaseDirection3D = baseDirection3D + offset;
							vec2 adjustedBaseDirection2D = cubeToUV( adjustedBaseDirection3D, texelSizeX, texelSizeY );
							dist = unpack1K( texture2D( shadowMap[ i ],  adjustedBaseDirection2D ) ) + 0.1;
							if ( curDistance >= dist )
								shadow += 1.0;
							numSamples += 1.0;

						}

						shadow /= numSamples;

					} else {

				#endif

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/
						
						/*
								// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL
								// must enroll loop manually
							for ( float y = -1.25; y <= 1.25; y += 1.25 )
								for ( float x = -1.25; x <= 1.25; x += 1.25 ) {
									vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );
											// doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup
											//vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );
									float fDepth = unpackDepth( rgbaDepth );
									if ( fDepth < shadowCoord.z )
										shadow += 1.0;
							}
							shadow /= 9.0;
						*/

						const float shadowDelta = 1.0 / 9.0;

						float xPixelOffset = texelSizeX;
						float yPixelOffset = texelSizeY;

						float dx0 = -1.25 * xPixelOffset;
						float dy0 = -1.25 * yPixelOffset;
						float dx1 = 1.25 * xPixelOffset;
						float dy1 = 1.25 * yPixelOffset;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

						fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );
						if ( fDepth < shadowCoord.z ) shadow += shadowDelta;

				#if defined(POINT_LIGHT_SHADOWS)

					}

				#endif

				shadowColor = shadowColor * vec3( ( 1.0 - realShadowDarkness * shadow ) );

			#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

				#if defined(POINT_LIGHT_SHADOWS)

					if( isPointLight ) {

						float cubeTexelSize = 1.0 / ( shadowMapSize[ i ].x * 0.25 );
						vec3 baseDirection3D = normalize( lightToPosition );
						vec2 baseDirection2D = cubeToUV( baseDirection3D, texelSizeX, texelSizeY );

						initGridSamplingDisk();

						float diskRadius = 2.25;
						float numSamples = 1.0;
						shadow = 0.0;

						vec3 baseDirection = normalize( lightToPosition );
						float curDistance = length( lightToPosition );

						float dist = unpack1K( texture2D( shadowMap[ i ],  baseDirection2D ) ) + 0.1;
						if ( curDistance >= dist )
							shadow += 1.0;

						// evaluate each sampling direction
						for( int s = 0; s < 20; s++ ) {

							vec3 offset = gridSamplingDisk[ s ] * diskRadius * cubeTexelSize;
							vec3 adjustedBaseDirection3D = baseDirection3D + offset;
							vec2 adjustedBaseDirection2D = cubeToUV( adjustedBaseDirection3D, texelSizeX, texelSizeY );
							dist = unpack1K( texture2D( shadowMap[ i ],  adjustedBaseDirection2D ) ) + 0.1;
							if ( curDistance >= dist )
								shadow += 1.0;
							numSamples += 1.0;

						}

						shadow /= numSamples;

					} else {

				#endif

						// Percentage-close filtering
						// (9 pixel kernel)
						// http://fabiensanglard.net/shadowmappingPCF/

						float xPixelOffset = texelSizeX;
						float yPixelOffset = texelSizeY;

						float dx0 = -1.0 * xPixelOffset;
						float dy0 = -1.0 * yPixelOffset;
						float dx1 = 1.0 * xPixelOffset;
						float dy1 = 1.0 * yPixelOffset;

						mat3 shadowKernel;
						mat3 depthKernel;

						depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );
						depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );
						depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );
						depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );
						depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );
						depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );
						depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );
						depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );
						depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );

						vec3 shadowZ = vec3( shadowCoord.z );
						shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));
						shadowKernel[0] *= vec3(0.25);

						shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));
						shadowKernel[1] *= vec3(0.25);

						shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));
						shadowKernel[2] *= vec3(0.25);

						vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );

						shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );
						shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );

						vec4 shadowValues;
						shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );
						shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );
						shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );
						shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );

						shadow = dot( shadowValues, vec4( 1.0 ) );

				#if defined(POINT_LIGHT_SHADOWS)
					
					}

				#endif

				shadowColor = shadowColor * vec3( ( 1.0 - realShadowDarkness * shadow ) );

			#else

				#if defined(POINT_LIGHT_SHADOWS)

					if( isPointLight ) {

						vec3 baseDirection3D = normalize( lightToPosition );
						vec2 baseDirection2D = cubeToUV( baseDirection3D, texelSizeX, texelSizeY );
						vec4 data = texture2D( shadowMap[ i ],  baseDirection2D );
						float dist = unpack1K( data ) + 0.1;
						if ( length( lightToPosition ) >= dist)
							shadowColor = shadowColor * vec3( 1.0 - realShadowDarkness );

					} else {

				#endif

						vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );
						float fDepth = unpackDepth( rgbaDepth );

						if ( fDepth < shadowCoord.z )

						// spot with multiple shadows is darker

						shadowColor = shadowColor * vec3( 1.0 - realShadowDarkness );

						// spot with multiple shadows has the same color as single shadow spot

						// 	shadowColor = min( shadowColor, vec3( realShadowDarkness ) );

				#if defined(POINT_LIGHT_SHADOWS)

					}

				#endif

			#endif

		}


		#ifdef SHADOWMAP_DEBUG

			if ( inFrustum ) outgoingLight *= frustumColors[ i ];

		#endif

	}

	outgoingLight = outgoingLight * shadowColor;

#endif
