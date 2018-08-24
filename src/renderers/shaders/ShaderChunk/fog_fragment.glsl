#ifdef USE_FOG

	// float fogDepth = length( vFogPosition );
	// mediump support: divide then multiply by max component

	vec3 fogPositionAbs = abs( vFogPosition );
	float fogMaxComponent = max( fogPositionAbs.x, max( fogPositionAbs.y, fogPositionAbs.z ) );
	float fogDepth = length( vFogPosition / fogMaxComponent ) * fogMaxComponent;

	#ifdef FOG_EXP2

		float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif
