export default /* glsl */`
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif

#ifdef USE_AMBIENT_OCCLUSION_MAP

	uniform sampler2D ambientOcclusionMap;

#endif
`;
