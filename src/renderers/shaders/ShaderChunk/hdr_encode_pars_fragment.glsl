#ifdef HDR_OUTPUT_LOGLUV
  // logLuvMatrix matrix, for encoding
  const mat3 logLuvMatrix = mat3(
      0.2209, 0.3390, 0.4184,
      0.1138, 0.6780, 0.7319,
      0.0102, 0.1130, 0.2969);

  vec4 HDREncode(in vec3 vRGB) 
  {
    // Based on http://www.xnainfo.com/content.php?content=28
    vec4 vResult; 
    vec3 Xp_Y_XYZp = logLuvMatrix * vRGB.xyz;
    Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
    vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
    float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
    vResult.w = fract(Le);
    vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
    return vResult;
  }

#elif defined( HDR_OUTPUT_RGBM )

  vec4 HDREncode( in vec3 color ) {
    vec4 rgbm;
    color *= 1.0 / 9.0;
    rgbm.a = clamp( max( max( color.r, color.g ), max( color.b, 1e-6 ) ) , 0.0, 1.0 );
    rgbm.a = ceil( rgbm.a * 255.0 ) / 255.0;
    rgbm.rgb = color.rgb / rgbm.a;
    return rgbm;
  }

#elif defined( HDR_OUTPUT_RGBD )

  vec4 HDREncode( in vec3 color ) {
    //Based on http://vemberaudio.se/graphics/RGBdiv8.pdf
    float maxRGB = max( max(1.0, color.r), max( color.g, color.b )); 
    return vec4(color.rgb, 1.0) / maxRGB;
  }

#elif defined( HDR_OUTPUT_RGBE )
  vec4 HDREncode( in vec3 color ) {

    //Based on http://www.graphics.cornell.edu/~bjw/rgbe/rgbe.c
    float maxComp = max( max( color.r, color.g ), color.b );
    float exponent = ceil( log2( maxComp ) );
    float value = exp2( exponent );
    vec3 mantissa = clamp( color / value, 0.0, 1.0 );
    return vec4( mantissa, ( exponent + 128.0 ) / 255.0 );
  }

#endif
