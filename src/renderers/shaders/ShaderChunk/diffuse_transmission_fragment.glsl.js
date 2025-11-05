export default /* glsl */`
#ifdef USE_DIFFUSE_TRANSMISSION

	float diffuseTransmissionFactor = diffuseTransmission;

	#ifdef USE_DIFFUSE_TRANSMISSIONMAP

		diffuseTransmissionFactor *= texture2D( diffuseTransmissionMap, vDiffuseTransmissionMapUv ).a;

	#endif

	vec3 diffuseTransmissionTint = diffuseTransmissionColor;

	#ifdef USE_DIFFUSE_TRANSMISSION_COLORMAP

		diffuseTransmissionTint *= texture2D( diffuseTransmissionColorMap, vDiffuseTransmissionColorMapUv ).rgb;

	#endif

	// Sample light from behind the surface (without refraction, unlike specular transmission)
	// Map fragment coord to normalized device coordinates for sampling the transmission render target
	vec2 fragCoord = gl_FragCoord.xy / transmissionSamplerSize;

	// Sample the transmission render target to get light from behind the surface
	vec4 transmittedLight = texture2D( transmissionSamplerMap, fragCoord );

	// Apply diffuse transmission color tint to the transmitted light
	vec3 diffuseTransmittedLight = transmittedLight.rgb * diffuseTransmissionTint;

	// Mix between reflected diffuse and transmitted diffuse light
	totalDiffuse = mix( totalDiffuse, diffuseTransmittedLight, diffuseTransmissionFactor );

#endif
`;
