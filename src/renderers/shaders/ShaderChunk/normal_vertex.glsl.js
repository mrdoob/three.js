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

	// the object's scale along the normal, from the same transforms the normal goes through
	vBumpScale = length( objectNormal ) / length( transformedNormal );

#endif
`;
