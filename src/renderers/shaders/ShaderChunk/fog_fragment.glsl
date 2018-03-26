#ifdef USE_FOG

	#ifdef FOG_EXP2

		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

	#endif

#if defined(NEEDSGLSL300)
	glFragColor.rgb = mix( glFragColor.rgb, fogColor, fogFactor );
#else
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif
#endif
