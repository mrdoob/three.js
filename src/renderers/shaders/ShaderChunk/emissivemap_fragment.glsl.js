export default /* glsl */`
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vUv[ 0 ] );

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif
`;
