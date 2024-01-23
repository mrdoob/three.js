export default /* glsl */`
#ifdef USE_MORPHNORMALS

	// morphTargetBaseInfluence is set based on BufferGeometry.morphTargetsRelative value:
	// When morphTargetsRelative is false, this is set to 1 - sum(influences); this results in normal = sum((target - base) * influence)
	// When morphTargetsRelative is true, this is set to 1; as a result, all morph targets are simply added to the base after weighting
	objectNormal *= morphTargetBaseInfluence;

	#ifdef MORPHTARGETS_TEXTURE

		#ifdef USE_INSTANCING_MORPH

			float influence = instanceMorph.y;

			if ( influence != 0.0 ) objectNormal += getMorph( gl_VertexID, int(instanceMorph.x), 1 ).xyz * influence;

			influence = instanceMorph.w;

			if ( influence != 0.0 ) objectNormal += getMorph( gl_VertexID, int(instanceMorph.z), 1 ).xyz * influence;

		#else

			for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {

				if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];

			}

		#endif
	#else

		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];

	#endif

#endif
`;
