import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryNode from '../core/VaryNode.js';
import ModelNode from '../accessors/ModelNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';
import { transformDirection } from '../functions/MathFunctions.js';

class PositionNode extends Node {

	static LOCAL = 'local';
	static WORLD = 'world';
	static VIEW = 'view';
	static VIEW_DIRECTION = 'viewDirection';

	constructor( scope = PositionNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === PositionNode.LOCAL ) {
			
			outputNode = new AttributeNode( 'position', 'vec3' );
			
		} else if ( scope === PositionNode.WORLD ) {

			const vertexPositionNode = transformDirection.call( { dir: new PositionNode( PositionNode.LOCAL ), matrix: new ModelNode( ModelNode.WORLD_MATRIX ) } );
			outputNode = new VaryNode( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW ) {

			const vertexPositionNode = new OperatorNode( '*', new ModelNode( ModelNode.VIEW_MATRIX ), new PositionNode( PositionNode.LOCAL ) );
			outputNode = new VaryNode( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW_DIRECTION ) {

			const vertexPositionNode = new MathNode( MathNode.NEGATE, new PositionNode( PositionNode.VIEW ) );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryNode( vertexPositionNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

}

export default PositionNode;
