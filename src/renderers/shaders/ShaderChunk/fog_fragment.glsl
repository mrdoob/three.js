#ifdef USE_FOG

	#ifdef USE_PRECISION_HIGHP

		float fogDepth = length(vFogPosition);

	#else

		float fogDepth = vFogDepth;

	#endif

	#ifdef FOG_EXP2

		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif
