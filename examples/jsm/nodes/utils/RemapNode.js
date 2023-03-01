import Node from '../core/Node.js';
import { add, sub, div, mul, clamp } from '../shadernode/ShaderNodeBaseElements.js';

class RemapNode extends Node {

	constructor( node, inLowNode, inHighNode, outLowNode, outHighNode ) {

		super();

		this.node = node;
		this.inLowNode = inLowNode;
		this.inHighNode = inHighNode;
		this.outLowNode = outLowNode;
		this.outHighNode = outHighNode;

		this.doClamp = true;

	}

	construct() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp } = this;

		let t = div( sub( node, inLowNode ), sub( inHighNode, inLowNode ) );

		if ( doClamp === true ) t = clamp( t );

		return add( mul( sub( outHighNode, outLowNode ), t ), outLowNode );

	}

}

export default RemapNode;
