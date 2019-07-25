export default /* glsl */`
#ifdef USE_CLEARCOAT_NORMALMAP

	#ifdef USE_TANGENT

		mat3 vTBN = mat3( tangent, bitangent, clearCoatNormal );
		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
		mapN.xy = clearCoatNormalScale * mapN.xy;
		clearCoatNormal = normalize( vTBN * mapN );

	#else

		clearCoatNormal = perturbNormal2Arb( - vViewPosition, clearCoatNormal, clearCoatNormalScale, clearCoatNormalMap );

	#endif

#endif
`;
