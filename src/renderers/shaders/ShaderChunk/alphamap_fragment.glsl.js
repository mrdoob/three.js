export default /* glsl */`
#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, ALPHAMAP_UVS ).g;

#endif
`;
