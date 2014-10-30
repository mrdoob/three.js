#ifdef USE_TONEMAPPING

	gl_FragColor.xyz = ToneMap( gl_FragColor.xyz );

#endif