export default `
#ifdef USE_NORMALMAP

	#ifdef OBJECTSPACE_NORMALMAP

		normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

		#ifdef FLIP_SIDED

			normal = - normal;

		#endif

		#ifdef DOUBLE_SIDED

			normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

		#endif

		normal = normalize( normalMatrix * normal );

	#else // tangent-space normal map

		normal = perturbNormal2Arb( -vViewPosition, normal );

	#endif

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif
`;
