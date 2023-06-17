export default /* glsl */`
#ifdef USE_SKINNING

	#ifdef USE_BONE_WEIGHTS_TEX

		vec3 skinnedNormal = vec3( 0.0 );

		{

			// boneTexWidth name conflicts with skinning_vertex.glsl.js if it's
			// enabled so we nest an extra block
			int boneTexWidth = int( textureSize( boneIndexWeightsTexture, 0 ).x );

			for ( int ii = 0; ii < MAX_BONES_PER_VERT; ++ ii ) {

				int bonePairTexIndex = bonePairTexStartIndex + ii;

				vec2 boneIndexWeight =
					texelFetch( boneIndexWeightsTexture,
					            ivec2( bonePairTexIndex % boneTexWidth,
					                   bonePairTexIndex / boneTexWidth ),
					            0 ).xy;

				int boneIndex = int( boneIndexWeight.x );

				if (boneIndex < 0) {

					break;

				}

				mat4 boneMatrix = getBoneMatrix( float( boneIndex ) );
				skinnedNormal +=
					normalize( mat3( bindMatrixInverse )
					         * mat3( boneMatrix )
					         * mat3( bindMatrix ) * objectNormal )
					* boneIndexWeight.y;

			}

		}

		objectNormal = skinnedNormal;

	#else

		mat4 skinMatrix = mat4( 0.0 );
		skinMatrix += skinWeight.x * boneMatX;
		skinMatrix += skinWeight.y * boneMatY;
		skinMatrix += skinWeight.z * boneMatZ;
		skinMatrix += skinWeight.w * boneMatW;
		skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

		objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;

	#endif

		#ifdef USE_TANGENT

			objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

		#endif

#endif
`;
