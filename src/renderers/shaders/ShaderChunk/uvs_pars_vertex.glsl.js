export default /* glsl */`
#ifdef USE_UV

	varying vec2 vUv;

	uniform mat3 uvTransform;

#endif
#ifdef USE_UV2

	attribute vec2 uv2;

	varying vec2 vUv2;

	uniform mat3 uv2Transform;

#endif
`;
