#if defined( TONE_MAPPING )

#if defined(NEEDSGLSL300)
  glFragColor.rgb = toneMapping( glFragColor.rgb );
#else
  gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif

#endif
