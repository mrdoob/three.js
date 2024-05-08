export default /* glsl */`
#ifdef USE_SKINNING

	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );

	#ifdef DUAL_QUATERNION_SKINNING

	vec4 skinned = vec4( 0.0 );
	skinned += scaleVecX * skinVertex * skinWeight.x;
	skinned += scaleVecY * skinVertex * skinWeight.y;
	skinned += scaleVecZ * skinVertex * skinWeight.z;
	skinned += scaleVecW * skinVertex * skinWeight.w;
	skinned = mulitplyVectorWithDualQuaternion( dq, skinned );

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
