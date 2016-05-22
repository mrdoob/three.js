#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHTS > 0

		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHTS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHTS ];

	#endif

	#if NUM_SPOT_LIGHTS > 0

		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHTS ];
		varying vec4 vSpotShadowCoord[ NUM_SPOT_LIGHTS ];

	#endif

	#if NUM_POINT_LIGHTS > 0

		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHTS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHTS ];

	#endif

	#if defined( SHADOWMAP_TYPE_PCSS )
		#define LIGHT_WORLD_SIZE 0.15
		#define LIGHT_FRUSTUM_WIDTH 3.75
		#define LIGHT_SIZE_UV (LIGHT_WORLD_SIZE / LIGHT_FRUSTUM_WIDTH)
		#define LIGHT_NEAR_PLANE 0.5
		#define LIGHT_FAR_PLANE 1000.0

		#define ROTATE_POISSON_SAMPLES

		#define NUM_SAMPLES 16
		//#define NUM_RINGS 11
		#define BLOCKER_SEARCH_NUM_SAMPLES NUM_SAMPLES
		#define PCF_NUM_SAMPLES NUM_SAMPLES

		vec2 poissonDisk[NUM_SAMPLES];

		void initPoissonSamples( const in vec2 randomSeed )
		{
			poissonDisk[0] = vec2(-0.94201624, -0.39906216 );
			poissonDisk[1] = vec2( 0.94558609, -0.76890725 );
			poissonDisk[2] = vec2( -0.094184101, -0.92938870 );
			poissonDisk[3] = vec2( 0.34495938, 0.29387760 );
			poissonDisk[4] = vec2( -0.91588581, 0.45771432 );
			poissonDisk[5] = vec2( -0.81544232, -0.87912464 );
			poissonDisk[6] = vec2( -0.38277543, 0.27676845 );
			poissonDisk[7] = vec2( 0.97484398, 0.75648379 );
			poissonDisk[8] = vec2( 0.44323325, -0.97511554 );
			poissonDisk[9] = vec2( 0.53742981, -0.47373420 );
			poissonDisk[10] = vec2( -0.26496911, -0.41893023 );
			poissonDisk[11] = vec2( 0.79197514, 0.19090188 );
			poissonDisk[12] = vec2( -0.24188840, 0.99706507 );
			poissonDisk[13] = vec2( -0.81409955, 0.91437590 );
			poissonDisk[14] = vec2( 0.19984126, 0.78641367 );
			poissonDisk[15] = vec2( 0.14383161, -0.14100790 );

			/*float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
			float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( randomSeed ) * PI2;
			float radius = INV_NUM_SAMPLES;
			float radiusStep = radius;

			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
				radius += radiusStep;
				angle += ANGLE_STEP;
			}*/
		}

		float penumbraSize( const in float zReceiverLightSpace, const in float zBlockerLightSpace ) { // Parallel plane estimation
			return (zReceiverLightSpace - zBlockerLightSpace) / zBlockerLightSpace;
		}

		float findBlocker( sampler2D shadowMap, const in vec2 uv, const in float zReceiverClipSpace, const in float zReceiverLightSpace, const in vec2 randomSeed ) {
			// This uses similar triangles to compute what
			// area of the shadow map we should search
			float searchRadius = LIGHT_SIZE_UV * ( zReceiverLightSpace - LIGHT_NEAR_PLANE ) / zReceiverLightSpace;
			float blockerDepthSum = 0.0;
			int numBlockers = 0;
			float angle = rand( randomSeed ) * PI2;
			float s = sin(angle);
			float c = cos(angle);
			for( int i = 0; i < BLOCKER_SEARCH_NUM_SAMPLES; i++ ) {
				#ifdef ROTATE_POISSON_SAMPLES
					vec2 poissonSample = vec2(poissonDisk[i].y * c + poissonDisk[i].x * s, poissonDisk[i].y * -s + poissonDisk[i].x * c);
			  #else
					vec2 poissonSample = poissonDisk[i];
				#endif
				float shadowMapDepth = unpackRGBAToDepth(texture2D(shadowMap, uv + poissonSample * searchRadius));
				if ( shadowMapDepth < zReceiverClipSpace ) {
					blockerDepthSum += shadowMapDepth;
					numBlockers ++;
				}
			}

			if( numBlockers == 0 ) return -1.0;

			return blockerDepthSum / float( numBlockers );
		}

		float PCF_Filter(sampler2D shadowMap, vec2 uv, float zReceiverClipSpace, float filterRadius, const in vec2 randomSeed ) {
			float sum = 0.0;
			float angle = rand( randomSeed ) * PI2;
			float s = sin(angle);
			float c = cos(angle);
			for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
				#ifdef ROTATE_POISSON_SAMPLES
					vec2 poissonSample = vec2(poissonDisk[i].y * c + poissonDisk[i].x * s, poissonDisk[i].y * -s + poissonDisk[i].x * c);
				#else
					vec2 poissonSample = poissonDisk[i];
				#endif
				float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + poissonSample * filterRadius ) );
				if( zReceiverClipSpace <= depth ) sum += 1.0;
			}
			for( int i = 0; i < PCF_NUM_SAMPLES; i ++ ) {
				#ifdef ROTATE_POISSON_SAMPLES
					vec2 poissonSample = vec2(poissonDisk[i].y * c + poissonDisk[i].x * s, poissonDisk[i].y * -s + poissonDisk[i].x * c);
				#else
					vec2 poissonSample = poissonDisk[i];
				#endif
				float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + -poissonSample.yx * filterRadius ) );
				if( zReceiverClipSpace <= depth ) sum += 1.0;
			}
			return sum / ( 2.0 * float( PCF_NUM_SAMPLES ) );
		}

		float PCSS ( sampler2D shadowMap, vec4 coords ) {
			vec2 uv = coords.xy;
			float zReceiverClipSpace = coords.z;
			float zReceiverLightSpace = -perspectiveDepthToViewZ( zReceiverClipSpace, LIGHT_NEAR_PLANE, LIGHT_FAR_PLANE );

			initPoissonSamples( uv );
			// STEP 1: blocker search
			float avgBlockerDepthClipSpace = findBlocker( shadowMap, uv, zReceiverClipSpace, zReceiverLightSpace, uv );

			//There are no occluders so early out (this saves filtering)
			if( avgBlockerDepthClipSpace == -1.0 ) return 1.0;

			float avgBlockerDepthLightSpace = -perspectiveDepthToViewZ( avgBlockerDepthClipSpace, LIGHT_NEAR_PLANE, LIGHT_FAR_PLANE );
			// STEP 2: penumbra size
			float penumbraRatio = penumbraSize( zReceiverLightSpace, avgBlockerDepthLightSpace );
			float filterRadius = penumbraRatio * LIGHT_SIZE_UV * LIGHT_NEAR_PLANE / zReceiverLightSpace;

			// STEP 3: filtering
			//return avgBlockerDepth;
			return PCF_Filter( shadowMap, uv, zReceiverClipSpace, filterRadius, uv );
		}

	#endif

	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {

		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );

	}

	float texture2DShadowLerp( sampler2D depths, vec2 size, vec2 uv, float compare ) {

		const vec2 offset = vec2( 0.0, 1.0 );

		vec2 texelSize = vec2( 1.0 ) / size;
		vec2 centroidUV = floor( uv * size + 0.5 ) / size;

		float lb = texture2DCompare( depths, centroidUV + texelSize * offset.xx, compare );
		float lt = texture2DCompare( depths, centroidUV + texelSize * offset.xy, compare );
		float rb = texture2DCompare( depths, centroidUV + texelSize * offset.yx, compare );
		float rt = texture2DCompare( depths, centroidUV + texelSize * offset.yy, compare );

		vec2 f = fract( uv * size + 0.5 );

		float a = mix( lb, lt, f.y );
		float b = mix( rb, rt, f.y );
		float c = mix( a, b, f.x );

		return c;

	}

	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;

		// if ( something && something ) breaks ATI OpenGL shader compiler
		// if ( all( something, something ) ) using this instead

		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
		bool inFrustum = all( inFrustumVec );

		bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

		bool frustumTest = all( frustumTestVec );

		if ( frustumTest ) {

		#if defined( SHADOWMAP_TYPE_PCF )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;

			return (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 9.0 );

		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;

			return (
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy, shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DShadowLerp( shadowMap, shadowMapSize, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 9.0 );

		#elif defined( SHADOWMAP_TYPE_PCSS )
		  return PCSS( shadowMap, shadowCoord);
		  return texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );

		#else // no percentage-closer filtering:

			return texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );

		#endif

		}

		return 1.0;

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

	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );

		// for point lights, the uniform @vShadowCoord is re-purposed to hold
		// the distance from the light to the world-space position of the fragment.
		vec3 lightToPosition = shadowCoord.xyz;

		// bd3D = base direction 3D
		vec3 bd3D = normalize( lightToPosition );
		// dp = distance from light to fragment position
		float dp = ( length( lightToPosition ) - shadowBias ) / 1000.0;

		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT )

			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;

			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );

		#else // no percentage-closer filtering

			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );

		#endif

	}

#endif
