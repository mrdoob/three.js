import Node from './Node.js';
import { addMethodChaining, nodeObject, nodeProxy } from '../tsl/TSLCore.js';

/**
 * Class for representing a uniform.
 *
 * @augments Node
 */
class NextNode extends Node {

	static get type() {

		return 'NextNode';

	}

	constructor( parentNode, nextNode ) {

		super( 'void' );

		this.isUniformNode = true;

		this.parentNode = parentNode;
		this.nextNode = nextNode;

	}

	setup( builder ) {

		this.parentNode.build( builder );

		return this.nextNode;

	}

}

export default NextNode;

export const next = /*@__PURE__*/ nodeProxy( NextNode );

addMethodChaining( 'next', next );

