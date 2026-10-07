export default /* glsl */`
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif

#ifdef USE_SSAO_MAP

	uniform sampler2D ssaoMap;

#endif
`;
