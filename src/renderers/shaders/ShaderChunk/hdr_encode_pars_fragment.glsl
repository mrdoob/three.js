#ifdef LOGLUV_HDR_OUTPUT
  // logLuvMatrix matrix, for encoding
  // const mat3 logLuvMatrix = mat3(
  //     0.2209, 0.3390, 0.4184,
  //     0.1138, 0.6780, 0.7319,
  //     0.0102, 0.1130, 0.2969);

  const mat3 logLuvMatrix = mat3(
      0.2209, 0.1138, 0.0102,
      0.3390, 0.6780, 0.1130,
      0.4184, 0.7319, 0.2969);

  vec4 LogLuvEncode(in vec3 vRGB) 
  {    
      vec4 vResult; 
      vec3 Xp_Y_XYZp = vRGB * logLuvMatrix;
      Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
      vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
      float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
      vResult.w = fract(Le);
      vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
      return vResult;
  }

#elif defined( RGBM_HDR_OUTPUT )

  vec4 RGBMEncode( vec3 color ) {
    vec4 rgbm;
    color *= 1.0 / 6.0;
    rgbm.a = clamp( max( max( color.r, color.g ), max( color.b, 1e-6 ) ) , 0.0, 1.0 );
    rgbm.a = ceil( rgbm.a * 255.0 ) / 255.0;
    rgbm.rgb = color / rgbm.a;
    return rgbm;
  }

#endif