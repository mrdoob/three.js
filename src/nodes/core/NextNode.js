import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/**
 * Adds the Node to the event list but does not generate the code, useful for PostProcessing.
 * It will execute the events of the first node and then the events of the next node.
 *
 * ```js
 * const depthPassNode = depthPass( scene, camera );
 *
 * postProcessing.outputNode = depthPassNode.next( myFunction() );
 *```
 *
 * @augments Node
 */
class NextNode extends Node {

	static get type() {

		return 'NextNode';

	}

	constructor( firstNode, nextNode ) {

		super( 'void' );

		this.isUniformNode = true;

		this.firstNode = firstNode;
		this.nextNode = nextNode;

	}

	setup( builder ) {

		this.firstNode.build( builder );

		return this.nextNode;

	}

}

export default NextNode;

export const next = /*@__PURE__*/ nodeProxy( NextNode );

addMethodChaining( 'next', next );

