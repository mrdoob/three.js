export default /* glsl */`
#ifdef USE_ALPHAHASH

	if ( diffuseColor.a < getAlphaHashThreshold( vPosition, alphaHashScale ) ) discard;

#endif
`;
