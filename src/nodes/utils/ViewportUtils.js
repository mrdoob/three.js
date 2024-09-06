import { Fn } from '../tsl/TSLBase.js';
import { screenUV } from '../display/ViewportNode.js';
import { viewportDepthTexture } from '../display/ViewportDepthTextureNode.js';
import { linearDepth } from '../display/ViewportDepthNode.js';

export const viewportSafeUV = /*@__PURE__*/ Fn( ( [ uv = null ] ) => {

	const depth = linearDepth();
	const depthDiff = linearDepth( viewportDepthTexture( uv ) ).sub( depth );
	const finalUV = depthDiff.lessThan( 0 ).select( screenUV, uv );

	return finalUV;

} );
