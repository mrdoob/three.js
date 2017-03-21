float glossinessFactor = glossiness;

#ifdef USE_GLOSSINESSMAP

	vec4 texelGlossiness = texture2D( glossinessMap, vUv );

	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture
	glossinessFactor *= texelGlossiness.a;

#endif
