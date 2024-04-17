export default /* glsl */`
#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );

	vBatchingOpacity = texelFetch( batchingOpacityTexture, ivec2( 0, batchId ), 0 ).r;
#endif
`;
