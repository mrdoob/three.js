export default /* glsl */`
#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vUv[ 0 ] ).g;

#endif
`;
