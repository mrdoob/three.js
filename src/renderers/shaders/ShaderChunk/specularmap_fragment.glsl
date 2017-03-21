#ifdef STANDARD_SG
	vec3 specularFactor = specular;

	#ifdef USE_SPECULARMAP

		vec4 texelSpecular = texture2D( specularMap, vUv );

		// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture
		specularFactor *= texelSpecular.rgb;

	#endif
#else
	float specularStrength;

	#ifdef USE_SPECULARMAP

		vec4 texelSpecular = texture2D( specularMap, vUv );
		specularStrength = texelSpecular.r;

	#else

		specularStrength = 1.0;

	#endif
#endif