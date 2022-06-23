export default /* glsl */`
#ifdef USE_ALPHATEST

	if ( diffuseColor.a < alphaTest ) discard;

#endif

#ifdef USE_ALPHAHASH

	if ( diffuseColor.a < getAlphaHashThreshold( vObjectPosition, alphaHashScale ) ) discard;

#endif
`;
