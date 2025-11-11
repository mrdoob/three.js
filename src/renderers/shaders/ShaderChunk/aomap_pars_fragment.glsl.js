export default /* glsl */`
#ifdef USE_AOMAP

	uniform mediump sampler2D aoMap;
	uniform float aoMapIntensity;

#endif
`;
