export default /* glsl */`
#ifdef USE_BATCHING
	float batchId = getIndirectIndex( gl_DrawID );
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif
`;
