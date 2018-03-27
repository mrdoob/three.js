#if defined(NEEDSGLSL300)
  glFragColor = linearToOutputTexel( glFragColor );
#else
  gl_FragColor = linearToOutputTexel( gl_FragColor );
#endif
