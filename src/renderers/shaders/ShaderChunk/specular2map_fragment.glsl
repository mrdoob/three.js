vec3 specular2Factor = specular2;

#ifdef USE_SPECULAR2MAP

	vec4 texelSpecular2 = texture2D( specular2Map, vUv );

	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture
	specular2Factor *= texelSpecular2.rgb;

#endif