export default /* glsl */`
#ifdef ANISOTROPY

  uniform float anisotropy;
  uniform float anisotropyRotation;

  #ifdef USE_ANISOTROPYMAP

    uniform sampler2D anisotropyMap;

  #endif

  #ifdef USE_ANISOTROPYROTATIONMAP

    uniform sampler2D anisotropyRotationMap;

  #endif

  vec2 calcAnisotropyUV( float anisotropyLocal ) {
    float oneMinusAbsAnisotropy = 1.0 - 0.9 * abs( anisotropyLocal );
    vec2 anisotropyUV = vec2 ( 1.0 / oneMinusAbsAnisotropy, oneMinusAbsAnisotropy );
    if( anisotropyLocal < 0.0 ) {
      anisotropyUV.xy = anisotropyUV.yx; // swizzel
    }
    return anisotropyUV;
  }

  vec3 getBentNormal(const GeometricContext geometry, const float anisotropyLocal, const float roughnessFactor) {
    vec3  anisotropyDirection = anisotropyLocal >= 0.0 ? geometry.anisotropicS : geometry.anisotropicT;
    vec3  anisotropicTangent  = cross(anisotropyDirection, geometry.viewDir);
    vec3  anisotropicNormal   = cross(anisotropicTangent, anisotropyDirection);
    float bendFactor          = abs(anisotropyLocal) * saturate(5.0 * roughnessFactor);
    vec3  bentNormal          = normalize(mix(geometry.normal, anisotropicNormal, bendFactor));

    return vec3(bentNormal);
  }

#endif
`;
