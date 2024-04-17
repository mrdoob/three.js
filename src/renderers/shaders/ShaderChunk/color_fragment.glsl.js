export default /* glsl */`
#if defined( USE_COLOR_ALPHA )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif

#if defined( USE_BATCHING )

	diffuseColor.a *= vBatchingOpacity;

#endif
`;
