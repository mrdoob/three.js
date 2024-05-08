export default /* glsl */`
#ifdef USE_SKINNING
	
	#ifdef DUAL_QUATERNION_SKINNING

		vec4 scaleVecX = getBoneScaleMatrix( skinIndex.x );
		vec4 scaleVecY = getBoneScaleMatrix( skinIndex.y );
		vec4 scaleVecZ = getBoneScaleMatrix( skinIndex.z );
		vec4 scaleVecW = getBoneScaleMatrix( skinIndex.w );

		mat2x4 boneDualQuatX = getBoneDualQuaternion( skinIndex.x );
		mat2x4 boneDualQuatY = getBoneDualQuaternion( skinIndex.y );
		mat2x4 boneDualQuatZ = getBoneDualQuaternion( skinIndex.z );
		mat2x4 boneDualQuatW = getBoneDualQuaternion( skinIndex.w );

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

	#else

		mat4 boneMatX = getBoneMatrix( skinIndex.x );
		mat4 boneMatY = getBoneMatrix( skinIndex.y );
		mat4 boneMatZ = getBoneMatrix( skinIndex.z );
		mat4 boneMatW = getBoneMatrix( skinIndex.w );

	#endif

#endif
`;
