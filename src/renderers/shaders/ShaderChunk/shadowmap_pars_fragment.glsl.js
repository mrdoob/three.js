export default /* glsl */`
#if NUM_SPOT_LIGHT_COORDS > 0

	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];

#endif

#if NUM_SPOT_LIGHT_MAPS > 0

	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];

#endif

#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];

		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];

	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0

		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];

		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];

		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};

		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];

	#endif

	float interleavedGradientNoise( vec2 position ) {

		return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );

	}

	vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {

		const float goldenAngle = 2.399963229728653;

		float r = sqrt( float( sampleIndex ) + 0.5 ) / sqrt( float( samplesCount ) );
		float theta = float( sampleIndex ) * goldenAngle + phi;

		float sine = sin( theta );
		float cosine = cos( theta );

		return vec2( cosine, sine ) * r;

	}

	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {

		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );

		#ifdef USE_REVERSED_DEPTH_BUFFER

			return step( depth, compare );

		#else

			return step( compare, depth );

		#endif

	}

	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {

		return unpackRGBATo2Half( texture2D( shadow, uv ) );

	}

	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {

		float occlusion = 1.0;

		vec2 distribution = texture2DDistribution( shadow, uv );

		#ifdef USE_REVERSED_DEPTH_BUFFER

			float hard_shadow = step( distribution.x, compare );

		#else

			float hard_shadow = step( compare, distribution.x );

		#endif

		if ( hard_shadow != 1.0 ) {

			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance ); // Chebeyshevs inequality
			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 ); // 0.3 reduces light bleed
			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );

		}
		return occlusion;

	}

	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

		float shadow = 1.0;

		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;

		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;

		if ( frustumTest ) {

		#if defined( SHADOWMAP_TYPE_PCF )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;

			vec2 offset = texelSize * shadowRadius;
			vec2 uv = shadowCoord.xy;
			float compare = shadowCoord.z;

			shadow = (
				texture2DCompare( shadowMap, uv + vogelDiskSample( 0, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 1, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 2, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 3, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 4, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 5, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 6, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 7, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 8, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 9, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 10, 12, phi ) * offset, compare ) +
				texture2DCompare( shadowMap, uv + vogelDiskSample( 11, 12, phi ) * offset, compare )
			) * ( 1.0 / 12.0 );

		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;

			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;

			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );

		#elif defined( SHADOWMAP_TYPE_VSM )

			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );

		#else // no percentage-closer filtering:

			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );

		#endif

		}

		return mix( 1.0, shadow, shadowIntensity );

	}

	// cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D
	// vector suitable for 2D texture mapping. This code uses the following layout for the
	// 2D texture:
	//
	// xzXZ
	//  y Y
	//
	// Y - Positive y direction
	// y - Negative y direction
	// X - Positive x direction
	// x - Negative x direction
	// Z - Positive z direction
	// z - Negative z direction
	//
	// Source and test bed:
	// https://gist.github.com/tschw/da10c43c467ce8afd0c4

	vec2 cubeToUV( vec3 v, float texelSizeY ) {

		// Number of texels to avoid at the edge of each square

		vec3 absV = abs( v );

		// Intersect unit cube

		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;

		// Apply scale to avoid seams

		// two texels less per square (one texel will do for NEAREST)
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );

		// Unwrap

		// space: -1 ... 1 range for each square
		//
		// #X##		dim    := ( 4 , 2 )
		//  # #		center := ( 1 , 1 )

		vec2 planar = v.xy;

		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;

		if ( absV.z >= almostOne ) {

			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;

		} else if ( absV.x >= almostOne ) {

			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;

		} else if ( absV.y >= almostOne ) {

			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;

		}

		// Transform to UV space

		// scale := 0.5 / dim
		// translate := ( center + 0.5 ) / dim
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );

	}

	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {

		float shadow = 1.0;

		// for point lights, the uniform @vShadowCoord is re-purposed to hold
		// the vector from the light to the world-space position of the fragment.
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );

		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {

			// dp = normalized distance from light to fragment position
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear ); // need to clamp?
			dp += shadowBias;

			// bd3D = base direction 3D
			vec3 bd3D = normalize( lightToPosition );

			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );

			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )

				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;

				float offset = shadowRadius * texelSize.y;
				float texelSizeY = texelSize.y;

				vec2 d0 = vogelDiskSample( 0, 8, phi ) * offset;
				vec2 d1 = vogelDiskSample( 1, 8, phi ) * offset;
				vec2 d2 = vogelDiskSample( 2, 8, phi ) * offset;
				vec2 d3 = vogelDiskSample( 3, 8, phi ) * offset;
				vec2 d4 = vogelDiskSample( 4, 8, phi ) * offset;
				vec2 d5 = vogelDiskSample( 5, 8, phi ) * offset;
				vec2 d6 = vogelDiskSample( 6, 8, phi ) * offset;
				vec2 d7 = vogelDiskSample( 7, 8, phi ) * offset;

				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + d0.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d1.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d2.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d3.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d4.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d5.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d6.xyx, texelSizeY ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + d7.xyx, texelSizeY ), dp )
				) * ( 1.0 / 8.0 );

			#else // no percentage-closer filtering

				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );

			#endif

		}

		return mix( 1.0, shadow, shadowIntensity );

	}

#endif
`;
