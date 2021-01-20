export default /* glsl */`
#ifdef USE_COLOR

	diffuseColor.rgb *= vColor;

#endif

#ifdef NODE_COLOR

	diffuseColor *= NODE_COLOR;

#endif
`;
