export default /* glsl */`
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )

	gl_FragDepthEXT = vIsPerspective == 1.0 ? log2( vFragDepth ) * logDepthBufFC * 0.5 : gl_FragCoord.z;

#endif
`;
