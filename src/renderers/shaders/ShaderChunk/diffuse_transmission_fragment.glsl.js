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

	// Apply diffuse transmission to the diffuse component
	// The diffuse component is mixed between reflected and transmitted light
	totalDiffuse = mix( totalDiffuse, totalDiffuse * diffuseTransmissionTint, diffuseTransmissionFactor );

#endif
`;
