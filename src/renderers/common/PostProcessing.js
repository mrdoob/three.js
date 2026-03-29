import RenderPipeline from './RenderPipeline.js';
import { warnOnce } from '../../utils.js';

/**
 * @deprecated since r183. Use {@link RenderPipeline} instead. PostProcessing has been renamed to RenderPipeline.
 *
 * This class is a wrapper for backward compatibility and will be removed in a future version.
 */
class PostProcessing extends RenderPipeline {

	/**
	 * Constructs a new post processing management module.
	 *
	 * @param {Renderer} renderer - A reference to the renderer.
	 * @param {Node<vec4>} outputNode - An optional output node.
	 * @deprecated since r183. Use {@link RenderPipeline} instead.
	 */
	constructor( renderer, outputNode ) {

		warnOnce( 'PostProcessing: "PostProcessing" has been renamed to "RenderPipeline". Please update your code to use "THREE.RenderPipeline" instead.' ); // @deprecated, r183

		super( renderer, outputNode );

	}

}

export default PostProcessing;
