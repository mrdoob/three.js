export default /* glsl */`
#ifdef USE_DISPLACEMENTMAP

	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vUv[ 0 ] ).x * displacementScale + displacementBias );

#endif
`;
