export default /* glsl */`
#ifdef USE_ROUGHNESSMAP

	#ifndef USE_OMRMAP

	uniform sampler2D roughnessMap;

	#endif

#endif
`;
