export default /* glsl */`
#ifdef USE_SKINNING

	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;

	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;

	mat4 getBoneMatrix( const in float i ) {

		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );

		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );

		y = dy * ( y + 0.5 );

		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );

		mat4 bone = mat4( v1, v2, v3, v4 );

		return bone;

	}

	#ifdef DUAL_QUATERNION_SKINNING

	vec4 getQuaternionFromMatrix( const in mat4 m ) {
		// Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
		// article "Quaternion Calculus and Fast Animation".
		float trace = m[0][0] + m[1][1] + m[2][2];
		float root;
		vec4 q;

		if ( trace > 0.0 ) {
			root = sqrt( trace + 1.0 );
			q.w = 0.5 * root;
			root = 0.5 / root;
			q.x = ( m[2][1] - m[1][2] ) * root;
			q.y = ( m[0][2] - m[2][0] ) * root;
			q.z = ( m[1][0] - m[0][1] ) * root;
		} else {
			int i = 0;
			if ( m[1][1] > m[0][0] ) {
				i = 1;
			} 
			if ( m[2][2] > m[i][i] ) {
				i = 2;
			}
			int j = ( i + 1 ) % 3;
			int k = ( i + 2 ) % 3;
			root = sqrt( m[i][i] - m[j][j] - m[k][k] + 1.0 );
			q[i] = 0.5 * root;
			root = 0.5 / root;
			q[3] = ( m[k][j] - m[j][k] ) * root;
			q[j] = ( m[j][i] + m[i][j] ) * root;
			q[k] = ( m[k][i] + m[i][k] ) * root;
		}
		
		q = normalize( q );
		q[3] = -q[3];
		
		return q;
	}

	mat2x4 getDualQuaternionFromMatrix( const in mat4 m ) {
		vec3 t = m[3].xyz;
		vec4 q = normalize( getQuaternionFromMatrix( m ) );

		float i =   0.5f * ( t.x * q.w + t.y * q.z - t.z * q.y );
		float j =   0.5f * ( t.y * q.w + t.z * q.x - t.x * q.z );
		float k =   0.5f * ( t.z * q.w + t.x * q.y - t.y * q.x );
		float w =  -0.5f * ( t.x * q.x + t.y * q.y + t.z * q.z );
		vec4 q2 = vec4( i, j, k, w );

		return mat2x4( q, q2 );
	}

	vec4 mulitplyVectorWithDualQuaternion( mat2x4 dq, vec4 v ) {
		vec4 qr = dq[0];
		vec4 qd = dq[1];
		vec3 pos = v.xyz + 2.0 * cross( qr.xyz, cross( qr.xyz, v.xyz ) + qr.w * v.xyz ); // Quaternion Rotation of a Vector            
		vec3 tran = 2.0 * ( qr.w * qd.xyz - qd.w * qr.xyz + cross( qr.xyz, qd.xyz ));	 // Pull out Translation from DQ
		return vec4(pos + tran, 0.0);
	}

	#endif

#endif
`;
