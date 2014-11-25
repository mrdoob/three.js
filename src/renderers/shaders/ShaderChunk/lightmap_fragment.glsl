#ifdef USE_LIGHTMAP

  vec4 lightMapColor = texture2D( lightMap, vUv2 );
  #ifdef LIGHTMAP_HDR_INPUT
    #if LIGHTMAP_HDR_INPUT == HDR_TYPE_RGBM
      lightMapColor.xyz = HDRDecodeRGBM( lightMapColor );
    #elif LIGHTMAP_HDR_INPUT == HDR_TYPE_RGBD
      lightMapColor.xyz = HDRDecodeRGBD( lightMapColor );
    #elif LIGHTMAP_HDR_INPUT == HDR_TYPE_LOGLUV
      lightMapColor.xyz = HDRDecodeLOGLUV( lightMapColor );
    #elif LIGHTMAP_HDR_INPUT == HDR_TYPE_RGBE
      lightMapColor.xyz = HDRDecodeRGBE( lightMapColor );
    #endif
  #endif

	gl_FragColor.xyz = gl_FragColor.xyz * lightMapColor.xyz;

#endif