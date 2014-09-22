#ifdef LOGLUV_HDR

	gl_FragColor = LogLuvEncode( gl_FragColor.xyz );

#elif defined( RGBM_HDR )
  
  gl_FragColor = RGBMEncode( gl_FragColor.xyz );

#endif