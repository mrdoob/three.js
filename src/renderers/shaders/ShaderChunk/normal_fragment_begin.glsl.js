export default /* glsl */`

// Workaround for Adreno/Nexus5 not able able to do dFdx( vViewPosition ) ...

vec3 fdx = vec3( dFdx( vViewPosition.x ), dFdx( vViewPosition.y ), dFdx( vViewPosition.z ) );
vec3 fdy = vec3( dFdy( vViewPosition.x ), dFdy( vViewPosition.y ), dFdy( vViewPosition.z ) );
vec3 faceNormal = normalize( cross( fdx, fdy ) );

#ifdef DOUBLE_SIDED

	// Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331

	float faceDirection = dot (vNormal, faceNormal) > 0. ? 1. : -1.;
	//float faceDirection = gl_FrontFacing ? 1. : -1.;

#elif defined( FLIP_SIDED )

	float faceDirection = -1.;

#else

	float faceDirection = 1.;

#endif

#ifdef FLAT_SHADED

	vec3 normal = faceNormal;

#else

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal *= faceDirection;

	#endif

	#ifdef USE_TANGENT

		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );

		#ifdef DOUBLE_SIDED

			tangent *= faceDirection;
			bitangent *= faceDirection;

		#endif

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 geometryNormal = normal;

`;
