export default /* glsl */`
#ifdef USE_AOMAP

	#ifndef USE_OMRMAP

	uniform sampler2D aoMap;

	#endif

	uniform float aoMapIntensity;

#endif
`;
