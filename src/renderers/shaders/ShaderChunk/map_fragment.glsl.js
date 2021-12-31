export default /* glsl */`
#ifdef USE_MAP

	diffuseColor *= texture2D( map, vUv );

#endif
`;
