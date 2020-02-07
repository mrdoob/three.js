export default /* glsl */`
#ifdef USE_ALPHAMAP

  diffuseColor.a *= texture2D( alphaMap, vUv ).g;
  diffuseColor.a = 1.0;

#endif
`;
