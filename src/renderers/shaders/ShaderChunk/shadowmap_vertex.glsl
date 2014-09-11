#ifdef USE_SHADOWMAP

	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

		vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;
    // #if defined( USE_LOGDEPTHBUF )
    //   vShadowCoord[ i ].z = log2(max(1e-6, vShadowCoord[ i ].w + 1.0)) * logDepthBufFC;
    //   #ifdef USE_LOGDEPTHBUF_EXT
    //     // vFragDepth = 1.0 + vShadowCoord[ i ].w;
    //   #else
    //     vShadowCoord[ i ].z = (vShadowCoord[ i ].z - 1.0);
    //   #endif
    // #endif

	}

#endif