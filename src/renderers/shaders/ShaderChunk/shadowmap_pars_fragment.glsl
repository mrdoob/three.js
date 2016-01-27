#ifdef USE_SHADOWMAP

	uniform sampler2D shadowMap[ NUM_SHADOWS ];
	uniform vec2 shadowMapSize[ NUM_SHADOWS ];

	uniform float shadowDarkness[ NUM_SHADOWS ];
	uniform float shadowBias[ NUM_SHADOWS ];

	varying vec4 vShadowCoord[ NUM_SHADOWS ];

	float unpackDepth( const in vec4 rgba_depth ) {

		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
		return dot( rgba_depth, bit_shift );

	}

	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {

		return step( unpackDepth( texture2D( depths, uv ) ), compare );

	}

	#ifdef POINT_LIGHT_SHADOWS

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

	#endif

#endif
