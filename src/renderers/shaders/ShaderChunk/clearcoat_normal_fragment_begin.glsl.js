export default /* glsl */`
#ifndef STANDARD
  #ifdef USE_CLEARCOAT_NORMALMAP
    vec3 clearCoatNormal = geometryNormal;
  #endif
#endif
`;
