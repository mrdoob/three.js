float specularStrength;

#ifdef USE_SPECULARMAP

	vec4 texelSpecular = texture2D( specularMap, vUv );
	specularStrength = texelSpecular.r * uSpecularStrength;

#else

	specularStrength = uSpecularStrength;

#endif