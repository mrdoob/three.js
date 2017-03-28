#if defined( REMOVE_BANDING )

  gl_FragColor.rgb = removeBanding( gl_FragColor.rgb );

#endif
