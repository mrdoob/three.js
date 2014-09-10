#ifdef USE_SKINNING

	#ifdef USE_MORPHTARGETS

	vec4 skinVertex = bindMatrix * vec4( morphed, 1.0 );

	#else

	vec4 skinVertex = bindMatrix * vec4( position, 1.0 );

	#endif

	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	skinned  = bindMatrixInverse * skinned;

#endif
