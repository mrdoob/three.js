export default /* glsl */`
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;

#ifdef FLAT_SHADED

	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );

#else

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal *= faceDirection;

	#endif

	#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )

		#ifdef USE_TANGENT

			mat3 vTBN = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

		#else

			mat3 vTBN = getTangentSpace( - vViewPosition, normal );

		#endif

		#ifdef DOUBLE_SIDED

			vTBN[0] *= faceDirection;
			vTBN[1] *= faceDirection;

		#endif

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 geometryNormal = normal;

`;
