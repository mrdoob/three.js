export default /* glsl */`
float faceDirection = 1.0;

#ifdef FLAT_SHADED

	// Workaround for Adreno GPUs not able to do dFdx( vViewPosition )

	vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
	vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
	vec3 normal = normalize( cross( fdx, fdy ) );

	faceDirection = sign( dot( vec3( 0, 0, 1 ), normal ) );

#else

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		// Workaround for Adreno GPUs not able to do dFdx( vViewPosition )

		vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
		vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );

		// Workaround for Adreno GPUs broken gl_FrontFacing implementation
		// https://stackoverflow.com/a/32621243

		faceDirection = sign( dot( normal, normalize( cross( fdx, fdy ) ) ) );

		normal = normal * faceDirection;

	#endif

	#ifdef USE_TANGENT

		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );

		#ifdef DOUBLE_SIDED

			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;

		#endif

		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )

			mat3 vTBN = mat3( tangent, bitangent, normal );

		#endif

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 geometryNormal = normal;

`;
