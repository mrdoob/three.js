#if defined( HDR_INPUT )

  // Inverse logLuvMatrix matrix, for decoding
  const mat3 InverseLogLuvMatrix = mat3(
    6.0014, -2.7008, -1.7996,
  -1.3320,  3.1029, -5.7721,
  0.3008, -1.0882,  5.6268);

  vec3 HDRDecodeLOGLUV(in vec4 vLogLuv)
  {
    // Based on http://www.xnainfo.com/content.php?content=28
    float Le = vLogLuv.z * 255.0 + vLogLuv.w;
    vec3 Xp_Y_XYZp;
    Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);
    Xp_Y_XYZp.z = Xp_Y_XYZp.y / vLogLuv.y;
    Xp_Y_XYZp.x = vLogLuv.x * Xp_Y_XYZp.z;
    vec3 vRGB = InverseLogLuvMatrix * Xp_Y_XYZp;
    return vRGB;
  }

  vec3 HDRDecodeRGBM( vec4 rgbm ) {
    //Based on http://vemberaudio.se/graphics/RGBdiv8.pdf
    return 6.0 * rgbm.rgb * rgbm.a;
  }

  vec3 HDRDecodeRGBD( vec4 rgbd ) {
    //Based on http://vemberaudio.se/graphics/RGBdiv8.pdf
    return rgbd.rgb / rgbd.a;
  }

  vec3 HDRDecodeRGBE( vec4 rgbe ) {
    //Based on http://www.graphics.cornell.edu/~bjw/rgbe/rgbe.c
    float f = exp2( rgbe.w * 255.0 - (128.0 + 0.0) );
    return rgbe.rgb * f;
  }
#endif
