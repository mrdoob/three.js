export default /* glsl */`
#ifdef USE_ENVMAP

	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;

	#ifdef ENVMAP_TYPE_PMREM

		// Mip level of a PMREM prefiltered for the given roughness. Must match PMREMGenerator.lodToRoughness().
		float roughnessToMip( const in float roughness ) {

			float r = clamp( roughness, 0.0, 1.0 );

			// The sharpest level is already blurred by one of its texels, so remove that much of the
			// GGX lobe: a lobe narrower than a texel reads as a mirror instead of blending into level 1.
			float texelAngle = 1.5707963267948966 / float( ENVMAP_SIZE ); // a cube face spans PI / 2 radians
			r = sqrt( sqrt( max( r * r * r * r - texelAngle * texelAngle, 0.0 ) ) );

			return ENVMAP_MAX_LOD * r * ( 2.0 - r );

		}

	#endif

#endif
`;
