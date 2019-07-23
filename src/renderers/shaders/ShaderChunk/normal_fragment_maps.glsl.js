export default /* glsl */`
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

		#ifdef USE_TANGENT

			mat3 vTBN = mat3( tangent, bitangent, normal );
			vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
			mapN.xy = normalScale * mapN.xy;
			normal = normalize( vTBN * mapN );

		#else

			normal = perturbNormal2Arb( -vViewPosition, normal, normalScale, normalMap );

		#endif

	#endif

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif
`;
