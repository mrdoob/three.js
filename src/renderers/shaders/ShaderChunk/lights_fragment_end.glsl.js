export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular(
		radiance,
		iblIrradiance,
		clearcoatRadiance,
		splitGeoNormal,
#ifdef USE_CLEARCOAT
		splitGeoClearcoatNormal,
#endif
		geometry,
		material,
		reflectedLight
	);

#endif
`;
