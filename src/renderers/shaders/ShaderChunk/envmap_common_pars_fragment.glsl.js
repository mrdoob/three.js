export default /* glsl */`
#ifdef USE_ENVMAP

	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;

	#ifdef ENVMAP_TYPE_PMREM

		// Invert PMREMGenerator.lodToRoughness(), accounting for base-level filtering.
		float roughnessToMip( const in float roughness ) {

			float r = clamp( roughness, 0.0, 1.0 );

			// Subtract the base level's texel footprint from the GGX lobe.
			float texelAngle = 1.5707963267948966 / float( ENVMAP_SIZE ); // a cube face spans PI / 2 radians
			r = sqrt( sqrt( max( r * r * r * r - texelAngle * texelAngle, 0.0 ) ) );

			return ENVMAP_MAX_LOD * r * ( 2.0 - r );

		}

	#endif

#endif
`;
