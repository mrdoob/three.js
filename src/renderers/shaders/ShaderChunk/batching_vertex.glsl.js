export default /* glsl */`
#ifdef USE_BATCHING_MATRIX
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#elif defined ( USE_BATCHING )
	mat4 batchingMatrix = mat4( 1.0 );
#endif
`;
