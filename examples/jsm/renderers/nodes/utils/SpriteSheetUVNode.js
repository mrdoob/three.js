import Node from '../core/Node.js';
import FloatNode from '../inputs/FloatNode.js';
import UVNode from '../accessors/UVNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import SplitNode from '../utils/SplitNode.js';
import JoinNode from '../utils/JoinNode.js';

class SpriteSheetUVNode extends Node {

	constructor( count, uv = new UVNode() ) {

		super( 'vec2' );

		this.count = count;
		this.uv = uv;
		this.frame = new FloatNode( 0 ).setConst( true );

	}

	generate( builder, output ) {

		const nodeData = builder.getDataFromNode( this );

		let uvFrame = nodeData.uvFrame;

		if ( nodeData.uvFrame === undefined ) {

			const uv = this.uv;
			const count = this.count;
			const frame = this.frame;

			const one = new FloatNode( 1 ).setConst( true );

			const width = new SplitNode( count, 'x' );
			const height = new SplitNode( count, 'y' );

			const total = new OperatorNode( '*', width, height );

			const roundFrame = new MathNode( MathNode.FLOOR, new MathNode( MathNode.MOD, frame, total ) );

			const frameNum = new OperatorNode( '+', roundFrame, one );

			const cell = new MathNode( MathNode.MOD, roundFrame, width );
			const row = new MathNode( MathNode.CEIL, new OperatorNode( '/', frameNum, width ) );
			const rowInv = new OperatorNode( '-', height, row );

			const scale = new OperatorNode( '/', one, count );

			const uvFrameOffset = new JoinNode( [
				new OperatorNode( '*', cell, new SplitNode( scale, 'x' ) ),
				new OperatorNode( '*', rowInv, new SplitNode( scale, 'y' ) )
			] );

			const uvScale = new OperatorNode( '*', uv, scale );

			uvFrame = new OperatorNode( '+', uvScale, uvFrameOffset );

			nodeData.uvFrame = uvFrame;

		}

		return uvFrame.build( builder, output );

	}

}

export default SpriteSheetUVNode;
