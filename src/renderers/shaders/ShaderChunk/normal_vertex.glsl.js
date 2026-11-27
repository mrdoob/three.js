export default /* glsl */`
#ifndef FLAT_SHADED // normal is computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

	#ifdef USE_TANGENT

		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

		#ifdef FLIP_SIDED

			vBitangent = - vBitangent;

		#endif

	#endif

#endif

#ifdef USE_BUMPMAP

	// Keep the full linear transform so the perturbation can be evaluated in
	// object space, including non-uniform model, batch and instance scales.
	vBumpMatrix = mat3( modelViewMatrix );

	#ifdef USE_INSTANCING

		vBumpMatrix *= mat3( instanceMatrix );

	#endif

	#ifdef USE_BATCHING

		vBumpMatrix *= mat3( batchingMatrix );

	#endif

#endif
`;
