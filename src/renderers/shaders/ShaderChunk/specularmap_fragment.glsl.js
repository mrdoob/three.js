export default /* glsl */`
float specularStrength;

#ifdef USE_SPECULARMAP

	vec4 texelSpecular = texture2D( specularMap, vUv[ 0 ] );
	specularStrength = texelSpecular.r;

#else

	specularStrength = 1.0;

#endif
`;
