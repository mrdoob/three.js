export default /* glsl */`
#if defined( USE_COLOR_ALPHA ) || defined( USE_BATCHING_COLOR )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif
`;
