export default `
#ifdef ALPHATEST

	if ( diffuseColor.a < ALPHATEST ) discard;

#endif
`;
