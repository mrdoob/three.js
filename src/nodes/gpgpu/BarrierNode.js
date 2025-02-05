import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/**
 * Represents a GPU control barrier that synchronizes compute operations within a given scope.
 *
 * This node can only be used with a WebGPU backend.
 *
 * @augments Node
 */
class BarrierNode extends Node {

	/**
	 * Constructs a new barrier node.
	 *
	 * @param {string} scope - The scope defines the behavior of the node.
	 */
	constructor( scope ) {

		super();

		this.scope = scope;

	}

	generate( builder ) {

		const { scope } = this;
		const { renderer } = builder;

		if ( renderer.backend.isWebGLBackend === true ) {

			builder.addFlowCode( `\t// ${scope}Barrier \n` );

		} else {

			builder.addLineFlowCode( `${scope}Barrier()`, this );

		}

	}

}

export default BarrierNode;

/**
 * TSL function for creating a barrier node.
 *
 * @tsl
 * @function
 * @param {string} scope - The scope defines the behavior of the node..
 * @returns {BarrierNode}
 */
const barrier = nodeProxy( BarrierNode );

/**
 * TSL function for creating a workgroup barrier. All compute shader
 * invocations must wait for each invocation within a workgroup to
 * complete before the barrier can be surpassed.
 *
 * @tsl
 * @function
 * @returns {BarrierNode}
 */
export const workgroupBarrier = () => barrier( 'workgroup' ).append();

/**
 * TSL function for creating a storage barrier. All invocations must
 * wait for each access to variables within the 'storage' address space
 * to complete before the barrier can be passed.
 *
 * @tsl
 * @function
 * @returns {BarrierNode}
 */
export const storageBarrier = () => barrier( 'storage' ).append();

/**
 * TSL function for creating a texture barrier. All invocations must
 * wait for each access to variables within the 'texture' address space
 * to complete before the barrier can be passed.
 *
 * @tsl
 * @function
 * @returns {BarrierNode}
 */
export const textureBarrier = () => barrier( 'texture' ).append();

