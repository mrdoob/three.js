export default /* glsl */`
#ifdef USE_SKINNING

	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;

	uniform highp sampler2D boneTexture;

	mat4 getBoneMatrix( const in float i ) {

		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );

		return mat4( v1, v2, v3, v4 );

	}

	#ifdef DUAL_QUATERNION_SKINNING

	mat2x4 getBoneDualQuaternion( const in float i ) {

		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );

		return mat2x4( v1, v2 );
	}

	vec4 mulitplyVectorWithDualQuaternion( mat2x4 dq, vec4 v ) {

		vec4 qr = dq[0];
		vec4 qd = dq[1];
		vec3 pos = v.xyz + 2.0 * cross( qr.xyz, cross( qr.xyz, v.xyz ) + qr.w * v.xyz ); // Quaternion Rotation of a Vector            
		vec3 tran = 2.0 * ( qr.w * qd.xyz - qd.w * qr.xyz + cross( qr.xyz, qd.xyz ));	 // Pull out Translation from DQ
		
		return vec4(pos + tran, 1.0);
	}

	#endif

#endif
`;
