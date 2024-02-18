export default /* glsl */`
#ifdef USE_MORPHTARGETS

	#ifndef USE_INSTANCING_MORPH

		uniform float morphTargetBaseInfluence;

	#endif

	#ifdef MORPHTARGETS_TEXTURE

		#ifndef USE_INSTANCING_MORPH

			uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];

		#endif

		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;

		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {

			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + 3 * offset;

			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;

			ivec3 morphUV = ivec3( x, y, morphTargetIndex );

			vec4 ret = vec4(0.);

			ret.x = texelFetch( morphTargetsTexture, morphUV, 0 ).r;

			morphUV.x++;

			ret.y = texelFetch( morphTargetsTexture, morphUV, 0 ).r;

			morphUV.x++;

			ret.z = texelFetch( morphTargetsTexture, morphUV, 0 ).r;

			#if MORPHTARGETS_TEXTURE_STRIDE == 10

				morphUV.x++;

				ret.a = offset == 2 ? texelFetch( morphTargetsTexture, morphUV, 0 ).r : 0.;

			#else

				ret.a = 0.;

			#endif

			return ret;

		}

	#else

		#ifndef USE_MORPHNORMALS

			uniform float morphTargetInfluences[ 8 ];

		#else

			uniform float morphTargetInfluences[ 4 ];

		#endif

	#endif

#endif
`;
