export default /* glsl */`
#ifdef ALPHATEST

	if ( diffuseColor.a < ALPHATEST ) discard;
	diffuseColor.a = 1.0;

#endif
`;
