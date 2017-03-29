#if defined( REMOVE_BANDING )

  gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
