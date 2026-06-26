import ReferenceBaseNode from './ReferenceBaseNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';

/**
 * This node is a special type of reference node which is intended
 * for linking renderer properties with node values.
 * ```js
 * const exposureNode = rendererReference( 'toneMappingExposure', 'float', renderer );
 * ```
 * When changing `renderer.toneMappingExposure`, the node value of `exposureNode` will
 * automatically be updated.
 *
 * @augments ReferenceBaseNode
 */
class RendererReferenceNode extends ReferenceBaseNode {

	static get type() {

		return 'RendererReferenceNode';

	}

	/**
	 * Constructs a new renderer reference node.
	 *
	 * @param {string} property - The name of the property the node refers to.
	 * @param {string} inputType - The uniform type that should be used to represent the property value.
	 * @param {?Renderer} [renderer=null] - The renderer the property belongs to. When no renderer is set,
	 * the node refers to the renderer of the current state.
	 */
	constructor( property, inputType, renderer = null ) {

		super( property, inputType, renderer );

		/**
		 * The renderer the property belongs to. When no renderer is set,
		 * the node refers to the renderer of the current state.
		 *
		 * @type {?Renderer}
		 * @default null
		 */
		this.renderer = renderer;

		this.setGroup( renderGroup );

	}

	/**
	 * Updates the reference based on the given state. The state is only evaluated
	 * {@link RendererReferenceNode#renderer} is not set.
	 *
	 * @param {(NodeFrame|NodeBuilder)} state - The current state.
	 * @return {Object} The updated reference.
	 */
	updateReference( state ) {

		this.reference = this.renderer !== null ? this.renderer : state.renderer;

		return this.reference;

	}

}

export default RendererReferenceNode;

/**
 * TSL function for creating a renderer reference node.
 *
 * @tsl
 * @function
 * @param {string} name - The name of the property the node refers to.
 * @param {string} type - The uniform type that should be used to represent the property value.
 * @param {?Renderer} [renderer=null] - The renderer the property belongs to. When no renderer is set,
 * the node refers to the renderer of the current state.
 * @returns {RendererReferenceNode}
 */
export const rendererReference = ( name, type, renderer = null ) => new RendererReferenceNode( name, type, renderer );
