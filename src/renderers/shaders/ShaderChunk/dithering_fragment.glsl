#if defined( DITHERING )

#if defined(NEEDSGLSL300)
  glFragColor.rgb = dithering( glFragColor.rgb );
#else
  gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif
#endif
