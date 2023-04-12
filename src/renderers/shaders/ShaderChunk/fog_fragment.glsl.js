export default /* glsl */`
#ifdef USE_FOG

	#ifdef FOG_EXP2
	
		vec3 scaledFogPosition = fogDensity * vFogPosition;
		float fogFactor = 1.0 - exp( - dot( scaledFogPosition, scaledFogPosition ) );

	#endif
	
	#ifdef FOG_EXP

		float fogDepth = precisionSafeLength( fogDensity * vFogPosition );
		float fogFactor = 1.0 - exp( - fogDepth );

	#endif

	#if ( ( ! defined FOG_EXP ) && ! defined FOG_EXP2 )

			float fogDepth = precisionSafeLength( vFogPosition );
			float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif
`;
