#ifdef USE_SHADOWMAP

	uniform samplerCube shadowCube[ MAX_SHADOWS ];
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

	vec4 pack1K ( float depth ) {
	
		depth /= 1000.0;
		const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
  		const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
   		vec4 res = fract( depth * bitSh );
   		res -= res.xxyz * bitMsk;
		return res;
		
	}

	float unpack1K ( vec4 color ) {
	
		const vec4 bitSh = vec4( 1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0 );
		return dot( color, bitSh ) * 1000.0;
		
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