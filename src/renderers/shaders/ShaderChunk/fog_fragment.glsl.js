export default /* glsl */`
#ifdef USE_FOG

	#ifdef FOG_EXP2
	
		vec3 scaledFogPosition = fogDensity * fogPosition;
		float fogFactor = 1.0 - exp( - dot( scaledFogPosition, scaledFogPosition ) );

	#else

		float fogDepth = precisionSafeLength( fogPosition );
		
		#ifdef FOG_EXP

			float fogFactor = whiteComplement( exp( - fogDensity * fogDepth ) );

		#else

			float fogFactor = smoothstep( fogNear, fogFar, fogDepth );

		#endif

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif
`;
