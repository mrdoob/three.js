export default /* glsl */`
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, EMMISSIVEMAP_UV );

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif
`;
