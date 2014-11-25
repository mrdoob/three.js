#if defined( HDR_OUTPUT_LOGLUV ) || defined( HDR_OUTPUT_RGBM ) || defined( HDR_OUTPUT_RGBD ) || defined( HDR_OUTPUT_RGBE )
  gl_FragColor = HDREncode( gl_FragColor.xyz );
#endif
