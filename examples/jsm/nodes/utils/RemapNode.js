import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class RemapNode extends TempNode {

	constructor( node, inLowNode, inHighNode, outLowNode, outHighNode ) {

		super();

		this.node = node;
		this.inLowNode = inLowNode;
		this.inHighNode = inHighNode;
		this.outLowNode = outLowNode;
		this.outHighNode = outHighNode;

		this.doClamp = true;
		this.doOut = true;

	}

	setup() {

		const { node, inLowNode, inHighNode, outLowNode, outHighNode, doClamp, doOut } = this;

		let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

		if ( doClamp === true ) t = t.clamp();
		if ( doOut === true ) t = t.mix( outLowNode, outHighNode );

		return t;

	}

}

export default RemapNode;

export const remap = nodeProxy( RemapNode, null, null, { doClamp: false } );
export const remapClamp = nodeProxy( RemapNode );
export const remapIn = nodeProxy( RemapNode, null, null, { doClamp: false, doOut: false } );
export const remapInClamp = nodeProxy( RemapNode, null, null, { doOut: false } );

addNodeElement( 'remap', remap );
addNodeElement( 'remapClamp', remapClamp );
addNodeElement( 'remapIn', remapIn );
addNodeElement( 'remapInClamp', remapInClamp );

addNodeClass( 'RemapNode', RemapNode );
