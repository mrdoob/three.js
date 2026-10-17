export default /* glsl */`
#ifdef USE_LIGHTMAP

	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
	vec3 lightMapIrradiance = vec3( 0.0 );

#endif
`;
