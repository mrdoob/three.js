export default /* glsl */`
// Workaround for Adreno GPUs not able to do dFdx( vViewPosition )

vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );

#ifdef FLAT_SHADED

	vec3 normal = normalize( cross( fdx, fdy ) );

	bool isFrontFacing = dot( vec3( 0, 0, 1 ), normalize( cross( fdx, fdy ) ) ) > 0.0;

#else

	vec3 normal = normalize( vNormal );

	// Workaround for Adreno GPUs gl_FrontFacing bug. See #10331 and #15850.

	bool isFrontFacing = dot( normal, normalize( cross( fdx, fdy ) ) ) > 0.0;

	#ifdef DOUBLE_SIDED

		normal = normal * ( float( isFrontFacing ) * 2.0 - 1.0 );

	#endif

	#ifdef USE_TANGENT

		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );

		#ifdef DOUBLE_SIDED

			tangent = tangent * ( float( isFrontFacing ) * 2.0 - 1.0 );
			bitangent = bitangent * ( float( isFrontFacing ) * 2.0 - 1.0 );

		#endif

		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )

			mat3 vTBN = mat3( tangent, bitangent, normal );

		#endif

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 geometryNormal = normal;

`;
