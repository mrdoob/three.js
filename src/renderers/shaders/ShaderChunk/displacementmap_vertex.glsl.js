export default /* glsl */`
#ifdef USE_DISPLACEMENTMAP

	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, DISPLACEMENTMAP_UVS ).x * displacementScale + displacementBias );

#endif
`;
