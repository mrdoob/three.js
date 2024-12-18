/**
 * Abstract class for implementing lighting models. The module defines
 * multiple methods that concrete lighting models can implement. These
 * methods are executed at different points during the light evaluation
 * process.
 */
class LightingModel {

	/**
	 * This method is intended for setting up lighting model and context data
	 * which are later used in the evaluation process.
	 *
	 * @abstract
	 * @param {ContextNode} input - The current node context.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	start( /*input, stack, builder*/ ) { }

	/**
	 * This method is intended for executing final tasks like final updates
	 * to the outgoing light.
	 *
	 * @abstract
	 * @param {ContextNode} input - The current node context.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	finish( /*input, stack, builder*/ ) { }

	/**
	 * This method is intended for implementing the direct light term and
	 * executed during the build process of directional, point and spot light nodes.
	 *
	 * @abstract
	 * @param {Object} input - The input data.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	direct( /*input, stack, builder*/ ) { }

	/**
	 * This method is intended for implementing the direct light term for
	 * rect area light nodes.
	 *
	 * @abstract
	 * @param {Object} input - The input data.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	directRectArea( /*input, stack, builder*/ ) {}

	/**
	 * This method is intended for implementing the indirect light term.
	 *
	 * @abstract
	 * @param {ContextNode} input - The current node context.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirect( /*input, stack, builder*/ ) { }

	/**
	 * This method is intended for implementing the ambient occlusion term.
	 * Unlike other methods, this method must be called manually by the lighting
	 * model in its indirect term.
	 *
	 * @abstract
	 * @param {ContextNode} input - The current node context.
	 * @param {StackNode} stack - The current stack.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	ambientOcclusion( /*input, stack, builder*/ ) { }

}

export default LightingModel;
