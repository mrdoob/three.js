#ifdef HDR_OUTPUT_LOGLUV
  // logLuvMatrix matrix, for encoding
  // const mat3 logLuvMatrix = mat3(
  //     0.2209, 0.3390, 0.4184,
  //     0.1138, 0.6780, 0.7319,
  //     0.0102, 0.1130, 0.2969);

  const mat3 logLuvMatrix = mat3(
      0.2209, 0.1138, 0.0102,
      0.3390, 0.6780, 0.1130,
      0.4184, 0.7319, 0.2969);

  vec4 HDREncodeLOGLUV(in vec4 vRGB) 
  {    
      vec4 vResult; 
      vec3 Xp_Y_XYZp = vRGB.xyz * logLuvMatrix;
      Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
      vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
      float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
      vResult.w = fract(Le);
      vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
      return vResult;
  }

#elif defined( HDR_OUTPUT_RGBM )

  vec4 HDREncodeRGBM( in vec4 color ) {
    vec4 rgbm;
    color *= 1.0 / 6.0;
    rgbm.a = clamp( max( max( color.r, color.g ), max( color.b, 1e-6 ) ) , 0.0, 1.0 );
    rgbm.a = ceil( rgbm.a * 255.0 ) / 255.0;
    rgbm.rgb = color.rgb / rgbm.a;
    return rgbm;
  }

#elif defined( HDR_OUTPUT_RGBD )

  vec4 HDREncodeRGBD( in vec4 color ) {
    float maxRGB = max( color.x, max( color.g, color.b ));
    float D = max( 6.0 / maxRGB, 1.0 );
    D = clamp( floor( D ) / 255.0, 0.0, 1.0 );
    return vec4( color.rgb * ( D * ( 255.0 / 6.0 )), D );
  }

#endif
