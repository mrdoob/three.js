export default /* glsl */`
#ifdef USE_SKINNING

	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );

	vec4 skinned = vec4( 0.0 );

	#ifdef USE_BONE_WEIGHTS_TEX

		{

			// boneTexWidth name conflicts with skinnormal_vertex.glsl.js if it's
			// enabled so we nest an extra block
			int boneTexWidth = int( textureSize( boneIndexWeightsTexture, 0 ).x );

			for ( int ii = 0; ii < MAX_BONES_PER_VERT; ++ ii ) {

				int bonePairTexIndex = bonePairTexStartIndex + ii;

				vec2 boneIndexWeight =
					texelFetch( boneIndexWeightsTexture,
					            ivec2( bonePairTexIndex % boneTexWidth,
					                   bonePairTexIndex / boneTexWidth),
					            0 ).xy;

				int boneIndex = int(boneIndexWeight.x);

				if ( boneIndex < 0 ) {

					break;

				}

				mat4 boneMatrix = getBoneMatrix( float( boneIndex ) );
				skinned += ( boneMatrix * skinVertex ) * boneIndexWeight.y;

			}

		}

	#else

		skinned += boneMatX * skinVertex * skinWeight.x;
		skinned += boneMatY * skinVertex * skinWeight.y;
		skinned += boneMatZ * skinVertex * skinWeight.z;
		skinned += boneMatW * skinVertex * skinWeight.w;

	#endif

	transformed = ( bindMatrixInverse * skinned ).xyz;

#endif
`;
