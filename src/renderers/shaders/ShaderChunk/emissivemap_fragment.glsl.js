export default /* glsl */`
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, EMISSIVEMAP_UVS );

	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif
`;
