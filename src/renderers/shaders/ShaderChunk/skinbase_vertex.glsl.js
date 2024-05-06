export default /* glsl */`
#ifdef USE_SKINNING

	#ifndef USE_BONE_WEIGHTS_TEX

		mat4 boneMatX = getBoneMatrix( skinIndex.x );
		mat4 boneMatY = getBoneMatrix( skinIndex.y );
		mat4 boneMatZ = getBoneMatrix( skinIndex.z );
		mat4 boneMatW = getBoneMatrix( skinIndex.w );

	#endif

#endif
`;
