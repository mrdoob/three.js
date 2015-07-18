#ifdef USE_FOG

	#ifdef USE_LOGDEPTHBUF_EXT

		float depth = gl_FragDepthEXT / gl_FragCoord.w;

	#else

		float depth = gl_FragCoord.z / gl_FragCoord.w;

	#endif

	#ifdef FOG_EXP2

		float fogFactor = exp2( - square( fogDensity ) * square( depth ) * LOG2 );
		fogFactor = whiteCompliment( fogFactor );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, depth );

	#endif
	
	outgoingLight = mix( outgoingLight, fogColor, fogFactor );

#endif