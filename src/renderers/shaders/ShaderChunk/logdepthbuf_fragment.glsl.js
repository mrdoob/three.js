export default /* glsl */`
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )

	// Doing a strict comparison with == 1.0 can cause noise artifacts
	// on some platforms. See issue #17623.
	gl_FragDepthEXT = vIsPerspective > 0.5 ? log2( vFragDepth ) * logDepthBufFC * 0.5 : gl_FragCoord.z;

#endif
`;
