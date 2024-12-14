import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/** @module BarrierNode **/

/**
 * TODO
 *
 * @augments Node
 */
class BarrierNode extends Node {

	/**
	 * Constructs a new barrier node.
	 *
	 * @param {String} scope - The scope defines the behavior of the node.
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
 * @function
 * @param {String} scope - The scope defines the behavior of the node..
 * @returns {BarrierNode}
 */
const barrier = nodeProxy( BarrierNode );

/**
 * TSL function for creating a workgroup barrier.
 *
 * @function
 * @returns {BarrierNode}
 */
export const workgroupBarrier = () => barrier( 'workgroup' ).append();

/**
 * TSL function for creating a storage barrier.
 *
 * @function
 * @returns {BarrierNode}
 */
export const storageBarrier = () => barrier( 'storage' ).append();

/**
 * TSL function for creating a texture barrier.
 *
 * @function
 * @returns {BarrierNode}
 */
export const textureBarrier = () => barrier( 'texture' ).append();

