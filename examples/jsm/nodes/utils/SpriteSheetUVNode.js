import Node from '../core/Node.js';
import ConstNode from '../core/ConstNode.js';
import UVNode from '../accessors/UVNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import SplitNode from '../utils/SplitNode.js';
import JoinNode from '../utils/JoinNode.js';

class SpriteSheetUVNode extends Node {

	constructor( countNode, uvNode = new UVNode(), frameNode = new ConstNode( 0 ) ) {

		super( 'vec2' );

		this.countNode = countNode;
		this.uvNode = uvNode;
		this.frameNode = frameNode;

	}

	construct() {

		const { frameNode, uvNode, countNode } = this;

		const one = new ConstNode( 1 );

		const width = new SplitNode( countNode, 'x' );
		const height = new SplitNode( countNode, 'y' );

		const total = new OperatorNode( '*', width, height );

		const roundFrame = new MathNode( MathNode.FLOOR, new MathNode( MathNode.MOD, frameNode, total ) );

		const frameNum = new OperatorNode( '+', roundFrame, one );

		const cell = new MathNode( MathNode.MOD, roundFrame, width );
		const row = new MathNode( MathNode.CEIL, new OperatorNode( '/', frameNum, width ) );
		const rowInv = new OperatorNode( '-', height, row );

		const scale = new OperatorNode( '/', one, countNode );

		const uvFrameOffset = new JoinNode( [
			new OperatorNode( '*', cell, new SplitNode( scale, 'x' ) ),
			new OperatorNode( '*', rowInv, new SplitNode( scale, 'y' ) )
		] );

		const uvScale = new OperatorNode( '*', uvNode, scale );
		const uvFrame = new OperatorNode( '+', uvScale, uvFrameOffset );

		return uvFrame;

	}

}

export default SpriteSheetUVNode;
