#ifdef LOGLUV_HDR_OUTPUT

	gl_FragColor = LogLuvEncode( gl_FragColor.xyz );

#elif defined( RGBM_HDR_OUTPUT )
  
  gl_FragColor = RGBMEncode( gl_FragColor.xyz );

#endif