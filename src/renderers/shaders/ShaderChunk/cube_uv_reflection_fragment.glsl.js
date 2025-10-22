export default /* glsl */`
#ifdef ENVMAP_TYPE_CUBE_UV

	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0

	// These shader functions convert between the UV coordinates of a single face of
	// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
	// sampling a textureCube (not generally normalized ).

	float getFace( vec3 direction ) {

		vec3 absDirection = abs( direction );

		// Determine major axis using branchless selection
		float maxAxis = max( max( absDirection.x, absDirection.y ), absDirection.z );
		
		// Create masks for each axis being dominant
		float isXDominant = step( absDirection.y, absDirection.x ) * step( absDirection.z, absDirection.x );
		float isYDominant = step( absDirection.x, absDirection.y ) * step( absDirection.z, absDirection.y );
		float isZDominant = 1.0 - isXDominant - isYDominant;
		
		// Compute face index for each case
		float xFace = step( 0.0, direction.x ) * 0.0 + step( direction.x, 0.0 ) * 3.0; // 0 or 3
		float yFace = step( 0.0, direction.y ) * 1.0 + step( direction.y, 0.0 ) * 4.0; // 1 or 4
		float zFace = step( 0.0, direction.z ) * 2.0 + step( direction.z, 0.0 ) * 5.0; // 2 or 5
		
		// Select the appropriate face
		return isXDominant * xFace + isYDominant * yFace + isZDominant * zFace;

	}

	// RH coordinate system; PMREM face-indexing convention
	vec2 getUV( vec3 direction, float face ) {

		vec2 uv = vec2( 0.0 );
		
		// Branchless UV calculation using step functions
		float isFace0 = step( abs( face - 0.0 ), 0.1 );
		float isFace1 = step( abs( face - 1.0 ), 0.1 );
		float isFace2 = step( abs( face - 2.0 ), 0.1 );
		float isFace3 = step( abs( face - 3.0 ), 0.1 );
		float isFace4 = step( abs( face - 4.0 ), 0.1 );
		float isFace5 = 1.0 - isFace0 - isFace1 - isFace2 - isFace3 - isFace4;
		
		// Compute UV for each face
		vec2 uv0 = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x
		vec2 uv1 = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y
		vec2 uv2 = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z
		vec2 uv3 = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x
		vec2 uv4 = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y
		vec2 uv5 = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z
		
		// Select the appropriate UV
		uv = uv0 * isFace0 + uv1 * isFace1 + uv2 * isFace2 + uv3 * isFace3 + uv4 * isFace4 + uv5 * isFace5;

		return 0.5 * ( uv + 1.0 );

	}

	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {

		float face = getFace( direction );

		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );

		mipInt = max( mipInt, cubeUV_minMipLevel );

		float faceSize = exp2( mipInt );

		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0; // #25071

		// Branchless adjustment for faces > 2
		float faceOffset = step( 2.5, face );
		uv.y += faceOffset * faceSize;
		face -= faceOffset * 3.0;

		uv.x += face * faceSize;

		uv.x += filterInt * 3.0 * cubeUV_minTileSize;

		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );

		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;

		#ifdef texture2DGradEXT

			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb; // disable anisotropic filtering

		#else

			return texture2D( envMap, uv ).rgb;

		#endif

	}

	// These defines must match with PMREMGenerator

	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0

	float roughnessToMip( float roughness ) {

		float mip = 0.0;

		if ( roughness >= cubeUV_r1 ) {

			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;

		} else if ( roughness >= cubeUV_r4 ) {

			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;

		} else if ( roughness >= cubeUV_r5 ) {

			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;

		} else if ( roughness >= cubeUV_r6 ) {

			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;

		} else {

			mip = - 2.0 * log2( 1.16 * roughness ); // 1.16 = 1.79^0.25
		}

		return mip;

	}

	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {

		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );

		float mipF = fract( mip );

		float mipInt = floor( mip );

		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );

		// Branchless mip interpolation
		vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
		float needsBlend = step( 0.0001, mipF ); // Only blend if mipF is not zero
		vec3 blendedColor = mix( color0, mix( color0, color1, mipF ), needsBlend );

		return vec4( blendedColor, 1.0 );

	}

#endif
`;
