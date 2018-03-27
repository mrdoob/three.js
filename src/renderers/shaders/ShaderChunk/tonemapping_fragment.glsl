#if defined( TONE_MAPPING )

  glFragColor.rgb = toneMapping( glFragColor.rgb );

#endif
