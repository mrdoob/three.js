export default /* glsl */ `
#if defined( USE_NORMALMAP )

	#ifdef USE_TANGENT

		mat3 vTBN = mat3( tangent, bitangent, clearCoatNormal );
		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
		mapN.xy = clearCoatNormalScale * mapN.xy;
		clearCoatNormal = normalize( vTBN * mapN );

	#else

	  clearCoatNormal = perturbClearCoatNormal2Arb( -vViewPosition, clearCoatNormal );

	#endif
#endif

`;
/*
#if defined( USE_NORMALMAP )

	#ifdef USE_TANGENT

		mat3 vTBN = mat3( tangent, bitangent, normal );
		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
		mapN.xy = clearCoatnormalScale * mapN.xy;
		clearCoatNormal = normalize( vTBN * mapN );

	#else

	  clearCoatNormal = perturbClearCoatNormal2Arb( -vViewPosition, clearCoatNormal );

	#endif
#endif
*/
/*
#if defined( USE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )

	//#ifdef OBJECTSPACE_NORMALMAP

		normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

		#ifdef FLIP_SIDED

			normal = - normal;

		#endif

		#ifdef DOUBLE_SIDED

			normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

		#endif

		normal = normalize( normalMatrix * normal );

	//#else // tangent-space normal map

		#ifdef USE_TANGENT

			mat3 vTBN = mat3( tangent, bitangent, normal );
			vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
			mapN.xy = normalScale * mapN.xy;
			normal = normalize( vTBN * mapN );

		#else

			normal = perturbNormal2Arb( -vViewPosition, normal );

		#endif

	//#endif

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif
*/
