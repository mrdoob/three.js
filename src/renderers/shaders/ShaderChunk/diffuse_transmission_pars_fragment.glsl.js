export default /* glsl */`
#ifdef USE_DIFFUSE_TRANSMISSION

	uniform float diffuseTransmission;
	uniform vec3 diffuseTransmissionColor;

	#ifdef USE_DIFFUSE_TRANSMISSIONMAP

		uniform sampler2D diffuseTransmissionMap;

	#endif

	#ifdef USE_DIFFUSE_TRANSMISSION_COLORMAP

		uniform sampler2D diffuseTransmissionColorMap;

	#endif

#endif
`;
