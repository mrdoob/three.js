export default /* glsl */`
#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )

	if ( skipLogDepth == 1.0 ) {

		gl_FragDepthEXT = gl_FragCoord.z;

	} else {

		gl_FragDepthEXT = log2( vFragDepth ) * logDepthBufFC * 0.5;

	}

#endif
`;
