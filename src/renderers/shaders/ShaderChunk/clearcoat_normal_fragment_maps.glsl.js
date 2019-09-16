export default /* glsl */`
#ifdef USE_CLEARCOAT_NORMALMAP

	#ifdef USE_TANGENT

		mat3 vTBN = mat3( tangent, bitangent, clearcoatNormal );
		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
		mapN.xy = clearcoatNormalScale * mapN.xy;
		clearcoatNormal = normalize( vTBN * mapN );

	#else

		clearcoatNormal = perturbNormal2Arb( - vViewPosition, clearcoatNormal, clearcoatNormalScale, clearcoatNormalMap );

	#endif

#endif
`;
