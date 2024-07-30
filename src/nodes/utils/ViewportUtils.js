import { tslFn } from '../shadernode/ShaderNode.js';
import { viewportTopLeft } from '../display/ViewportNode.js';
import { viewportDepthTexture } from '../display/ViewportDepthTextureNode.js';
import { linearDepth } from '../display/ViewportDepthNode.js';

export const viewportSafeUV = tslFn( ( [ uv = null ] ) => {

	const depth = linearDepth();
	const depthDiff = linearDepth( viewportDepthTexture( uv ) ).sub( depth );
	const finalUV = depthDiff.lessThan( 0 ).cond( viewportTopLeft, uv );

	return finalUV;

} );
