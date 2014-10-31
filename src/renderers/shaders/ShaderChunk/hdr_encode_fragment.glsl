#ifdef HDR_OUTPUT_LOGLUV

	gl_FragColor = HDREncodeLOGLUV( gl_FragColor );

#elif defined( HDR_OUTPUT_RGBM )

  gl_FragColor = HDREncodeRGBM( gl_FragColor );

#endif