export default /* glsl */`
#ifdef USE_SKINNING

	mat4 skinMatrix = mat4( 0.0 );

	#ifdef DUAL_QUATERNION_SKINNING
   
		objectNormal = (bindMatrix * vec4( objectNormal, 0.0 )).xyz;
		objectNormal = objectNormal + 2.0 * cross( dq[0].xyz, cross( dq[0].xyz, objectNormal ) + dq[0].w * objectNormal );
		objectNormal = (bindMatrixInverse * vec4( objectNormal, 0.0 )).xyz;

		#ifdef USE_TANGENT

			objectTangent = (bindMatrix * vec4( objectTangent, 0.0 )).xyz;
			objectTangent = objectTangent + 2.0 * cross( dq[0].xyz, cross( dq[0].xyz, objectTangent ) + dq[0].w * objectTangent );
			objectTangent = (bindMatrixInverse * vec4( objectTangent, 0.0 )).xyz;

		#endif

	#else
		
		skinMatrix += skinWeight.x * boneMatX;
		skinMatrix += skinWeight.y * boneMatY;
		skinMatrix += skinWeight.z * boneMatZ;
		skinMatrix += skinWeight.w * boneMatW;
		skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
		objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;

		#ifdef USE_TANGENT

			objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

		#endif

	#endif

#endif
`;
