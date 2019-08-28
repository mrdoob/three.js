export default /* glsl */`
#ifdef ANISOTROPY

  float anisotropyFactor = anisotropy;
  float anisotropyRotationFactor = anisotropyRotation;

  #ifdef USE_ANISOTROPYMAP

    anisotropyFactor *= texture2D (anisotropyMap, vUv ).r;

  #endif

  #ifdef USE_ANISOTROPYROTATIONMAP

    anisotropyRotationFactor += texture2D( anisotropyRotationMap, vUv ).r;

  #endif

#endif
`;
