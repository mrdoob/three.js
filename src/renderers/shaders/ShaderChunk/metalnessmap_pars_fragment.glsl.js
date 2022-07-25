export default /* glsl */`
// stick this here for now.
#ifdef USE_OMRMAP

	uniform sampler2D occlusionMetalRoughnessMap;

#endif


#ifdef USE_METALNESSMAP

	#ifndef USE_OMRMAP

	uniform sampler2D metalnessMap;

	#endif

#endif
`;
