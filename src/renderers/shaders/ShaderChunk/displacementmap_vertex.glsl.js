export default /* glsl */`
#ifdef USE_DISPLACEMENTMAP

	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, DISPLACEMENT_MAP_UVS ).x * displacementScale + displacementBias );

#endif
`;
