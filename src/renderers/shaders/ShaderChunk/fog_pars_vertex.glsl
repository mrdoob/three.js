#ifdef USE_FOG

#if defined(NEEDSGLSL300)
  out float fogDepth;
#else
  varying float fogDepth;
#endif

#endif
