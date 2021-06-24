export default /* glsl */`
#ifdef USE_LOGDEPTHBUF

	if ( isPerspectiveMatrix( projectionMatrix ) ) {

		gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;

		gl_Position.z *= gl_Position.w;

	}

#endif
`;
