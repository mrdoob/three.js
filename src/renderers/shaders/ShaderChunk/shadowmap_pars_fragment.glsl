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
	int gridSamplingInitialized = 0;

	void initGridSamplingDisk(){
	
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
		
	}

	float getCubeShadowMapFloat( const in int cubeIndex, in vec3 baseDirection ){

		vec4 data = vec4( 0, 0, 0, 0 );

		// This loop may seem silly and unnecessary, but we can't use @cubeIndex to access @shadowCube
		// directly, since its bounds are unknown to the compiler. The compiler
		// knows the bounds of the loop variable 'i' so we CAN use that to index
		// into @shadowCube. The alternative to this is to send the samplerCube directly
		// to this function as a parameter, but come drivers don't allow that.

		for( int i = 0; i < MAX_SHADOWS; i++ ) {

			if( i == cubeIndex ){

				data =  textureCube(shadowCube[ i ],  baseDirection);
				break;

			}

		}

		float dist = unpack1K( data );
		return dist;	
		
	}	

	float sampleCubeShadowMapPCF( const in int cubeIndex, in vec3 baseDirection, in float curDistance, in float texSize, float softness ){
	
		if( gridSamplingInitialized == 0 ){
		
			initGridSamplingDisk();
			gridSamplingInitialized = 1;
			
		}

		// radius of PCF depending on distance from the light source
		float diskRadius = softness;
		float numSamples = 0.0;
		float shadowFactor = 0.0;

		float dist = getCubeShadowMapFloat( cubeIndex, baseDirection );
		if ( curDistance >= dist )
			shadowFactor += 1.0;
		numSamples += 1.0;
		
		// evaluate each sampling direction
		for( int i = 0; i < 20; i++ ){
		 
			vec3 offset = gridSamplingDisk[ i ] * diskRadius * texSize;
			dist = getCubeShadowMapFloat( cubeIndex, vec3( baseDirection + offset ) );
			if ( curDistance >= dist )
				shadowFactor += 1.0;
			numSamples += 1.0;
			
		}

		shadowFactor /= numSamples;
		return shadowFactor;

	}

#endif