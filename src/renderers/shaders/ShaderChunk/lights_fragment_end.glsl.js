export default /* glsl */`
#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, irradiance, clearCoatRadiance, geometry, material, reflectedLight );

#endif
`;
