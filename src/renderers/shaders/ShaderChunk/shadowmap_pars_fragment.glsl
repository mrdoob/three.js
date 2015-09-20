#ifdef USE_SHADOWMAP
	
	uniform sampler2D shadowMap[ MAX_SHADOWS ];
	uniform vec2 shadowMapSize[ MAX_SHADOWS ];

	uniform float shadowDarkness[ MAX_SHADOWS ];
	uniform float shadowBias[ MAX_SHADOWS ];

	varying vec4 vShadowCoord[ MAX_SHADOWS ];

	float unpackDepth( const in vec4 rgba_depth ) {

		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
		float depth = dot( rgba_depth, bit_shift );
		return depth;

	}

	#if defined(POINT_LIGHT_SHADOWS)

		float unpack1K ( vec4 color ) {
		
			const vec4 bitSh = vec4( 1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0 );
			return dot( color, bitSh ) * 1000.0;
			
		}

		vec2 cubeToUV( vec3 v, float texelSizeX, float texelSizeY ) {

			// Horizontal cross layout:
			const vec2 Squares = vec2( 4.0, 2.0 );
			const vec2 Center = vec2( 1.0, 0.0 );

			// Size of a square in UV space:
			const vec2 TexSquareSize = 1.0 / Squares;

			// UV space offset of the center of the center square of the cross:
			const vec2 TexCoordOffs = TexSquareSize * ( 0.5 + Center );

			// Factors to scale square space (-1..+1 per square) to UV space:
			const vec2 TexSquareScale = TexSquareSize * 0.5;

			// Just less than a texel in square space when divided by resolution:
			const float TexEps = 1.5; // = min(Squares.x, Squares.y) - 0.5;

			vec3 absV = abs( v );
			vec3 sgnV = sign( v );

			// Intersect unit cube

			float scale = 1.0 / max( absV.x, max( absV.y, absV.z ) );

			v *= scale; 
			absV *= scale;

			// Determine gate factors

			// gate.? is one when on left / right, bottom / top, back
			float eps = TexEps * texelSizeY;
			vec3 gate = step( 1.0 - eps, vec3( absV.xy, v.z ) );

			// prefer any square over bottom / top
			float notX = 1. - gate.x;
			float notZ = 1. - gate.z;
			gate.y *= notX * notZ;
			// prefer back over side
			gate.x *= notZ;

			// Unwrap

			// start with xy coordinates
			vec2 planar = v.xy;

			// stop at the last texel (can use a factor of 1.0 for NEAREST)
			float yTexelSize = 2.0 * Squares.y * texelSizeY;
			float yAdjusted = planar.y * ( 1.0 - yTexelSize );
			planar.y = yAdjusted;
			planar.y -= gate.y * yAdjusted;

			// unwrap left / right, top / bottom
			planar.x += gate.x * ( sgnV.x + v.z * sgnV.x );

			planar.x += gate.y * ( -sgnV.y * 2.0 );
			planar.y += gate.y * ( 2.0  + ( v.z * sgnV.y ) );

			// unwrap back
			planar.x += gate.z * ( 4.0 - 2.0 * planar.x );

			// adjust to UV space
			return TexCoordOffs + planar * TexSquareScale; 
			
		}

		vec3 gridSamplingDisk[ 20 ];
		bool gridSamplingInitialized = false;

		void initGridSamplingDisk(){

			if( gridSamplingInitialized ){

				return;

			}

			gridSamplingDisk[0] = vec3(1, 1, 1);
			gridSamplingDisk[1] = vec3(1, -1, 1);
			gridSamplingDisk[2] = vec3(-1, -1, 1);
			gridSamplingDisk[3] = vec3(-1, 1, 1);
			gridSamplingDisk[4] = vec3(1, 1, -1);
			gridSamplingDisk[5] = vec3(1, -1, -1);
			gridSamplingDisk[6] = vec3(-1, -1, -1);
			gridSamplingDisk[7] = vec3(-1, 1, -1);
			gridSamplingDisk[8] = vec3(1, 1, 0);
			gridSamplingDisk[9] = vec3(1, -1, 0);
			gridSamplingDisk[10] = vec3(-1, -1, 0);
			gridSamplingDisk[11] = vec3(-1, 1, 0);
			gridSamplingDisk[12] = vec3(1, 0, 1);
			gridSamplingDisk[13] = vec3(-1, 0, 1);
			gridSamplingDisk[14] = vec3(1, 0, -1);
			gridSamplingDisk[15] = vec3(-1, 0, -1);
			gridSamplingDisk[16] = vec3(0, 1, 1);
			gridSamplingDisk[17] = vec3(0, -1, 1);
			gridSamplingDisk[18] = vec3(0, -1, -1);
			gridSamplingDisk[19] = vec3(0, 1, -1);

			gridSamplingInitialized = true;
			
		}

	#endif

#endif