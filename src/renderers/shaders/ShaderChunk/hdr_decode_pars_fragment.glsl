#ifdef LOGLUV_HDR_INPUT

  // Inverse logLuvMatrix matrix, for decoding
  const mat3 InverseLogLuvMatrix = mat3(
    6.0013, -1.332, .3007,
    -2.700, 3.1029, -1.088,
    -1.7995, -5.7720, 5.6268);  

  vec3 LogLuvDecode(in vec4 vLogLuv)
  { 
    float Le = vLogLuv.z * 255.0 + vLogLuv.w;
    vec3 Xp_Y_XYZp;
    Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);
    Xp_Y_XYZp.z = Xp_Y_XYZp.y / vLogLuv.y;
    Xp_Y_XYZp.x = vLogLuv.x * Xp_Y_XYZp.z;
    vec3 vRGB = InverseLogLuvMatrix * Xp_Y_XYZp;
    return clamp(vRGB, 0.0, 1.0);
  }
#elif defined( RGBM_HDR_INPUT )

  vec3 RGBMDecode( vec4 rgbm ) {
    return 6.0 * rgbm.rgb * rgbm.a;
  }

#elif defined( RGBD_HDR_INPUT )
  vec3 RGBMDecode( vec4 rgbd ) {
    // return rgbd.rgb * ((MaxRange / 255.0) / rgbd.a);
    return rgbd.rgb * / rgbd.a;
  }

#endif