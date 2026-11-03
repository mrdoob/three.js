export default /* glsl */`
vec3 objectNormal = vec3( normal );

#ifdef USE_TANGENT

	vec3 objectTangent = vec3( tangent.xyz );

	// a zero-length tangent, as left where a vertex's uvs are degenerate, would normalize to NaN, so
	// any direction perpendicular to the normal is used instead
	if ( dot( objectTangent, objectTangent ) == 0.0 ) {

		objectTangent = cross( objectNormal, abs( objectNormal.x ) < 0.9 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 1.0, 0.0 ) );

	}

#endif
`;
