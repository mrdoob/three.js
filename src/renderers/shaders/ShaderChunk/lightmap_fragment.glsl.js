export default /* glsl */`
#ifdef USE_LIGHTMAP

	vec4 lightMapTexel = texture2D( lightMap, LIGHTMAP_UV );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

	reflectedLight.indirectDiffuse += lightMapIrradiance;

#endif
`;
