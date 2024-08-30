import Node, { registerNode } from '../core/Node.js';
import { float, addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class RemapNode extends Node {

	constructor( node, inLowNode, inHighNode, outLowNode = float( 0 ), outHighNode = float( 1 ) ) {

		super();

		this.node = node;
		this.inLowNode = inLowNode;
		this.inHighNode = inHighNode;
		this.outLowNode = outLowNode;
		this.outHighNode = outHighNode;

		this.doClamp = true;

	}

	setup() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp } = this;

		let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

		if ( doClamp === true ) t = t.clamp();

		return t.mul( outHighNode.sub( outLowNode ) ).add( outLowNode );

	}

}

export default RemapNode;

RemapNode.type = /*@__PURE__*/ registerNode( 'Remap', RemapNode );

export const remap = /*@__PURE__*/ nodeProxy( RemapNode, null, null, { doClamp: false } );
export const remapClamp = /*@__PURE__*/ nodeProxy( RemapNode );

addMethodChaining( 'remap', remap );
addMethodChaining( 'remapClamp', remapClamp );
