export default /* glsl */`
#ifdef USE_SKINNING

	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );

	#ifdef DUAL_QUATERNION_SKINNING

	mat2x4 boneDualQuatX = getDualQuaternionFromMatrix( boneMatX );
	mat2x4 boneDualQuatY = getDualQuaternionFromMatrix( boneMatY );
	mat2x4 boneDualQuatZ = getDualQuaternionFromMatrix( boneMatZ );
	mat2x4 boneDualQuatW = getDualQuaternionFromMatrix( boneMatW );
	vec4 normalizedSkinWeight = normalize( skinWeight );

    if ( dot(boneDualQuatX[0], boneDualQuatY[0]) < 0.0 ) {
        normalizedSkinWeight.y *= -1.0;
    }

    if ( dot(boneDualQuatX[0], boneDualQuatZ[0]) < 0.0 ) {
        normalizedSkinWeight.z *= -1.0;
    }

    if ( dot(boneDualQuatX[0], boneDualQuatW[0]) < 0.0 ) {
        normalizedSkinWeight.w *= -1.0;
    }
	
	mat2x4 dq = boneDualQuatX * normalizedSkinWeight.x
			  + boneDualQuatY * normalizedSkinWeight.y 
			  + boneDualQuatZ * normalizedSkinWeight.z 
			  + boneDualQuatW * normalizedSkinWeight.w;
	dq /= length( dq[ 0 ] );

	vec4 skinned = mulitplyVectorWithDualQuaternion( dq, skinVertex );

	#else

	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;

	#endif

	transformed = ( bindMatrixInverse * skinned ).xyz;

#endif
`;
