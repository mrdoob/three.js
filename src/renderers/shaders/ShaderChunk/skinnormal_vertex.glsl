#ifdef USE_SKINNING

	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;

	#ifdef USE_MORPHNORMALS

	vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );

	#else

	vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );

	#endif

#endif
