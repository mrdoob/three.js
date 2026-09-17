export default /* glsl */`
#ifdef USE_ENVMAP

	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;

	#ifdef ENVMAP_TYPE_PMREM

		// Mip level of a PMREM prefiltered for the given roughness. Must match PMREMGenerator.lodToRoughness().
		float roughnessToMip( const in float roughness ) {

			return ENVMAP_MAX_LOD * roughness * ( 2.0 - roughness );

		}

	#endif

#endif
`;
