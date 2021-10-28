import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import NodeKeywords from '../core/NodeKeywords.js';
import VaryNode from '../core/VaryNode.js';
import ModelNode from '../accessors/ModelNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';

class PositionNode extends Node {

	static GEOMETRY = 'geometry';
	static LOCAL = 'local';
	static WORLD = 'world';
	static VIEW = 'view';
	static VIEW_DIRECTION = 'viewDirection';

	constructor( scope = PositionNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `position-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === PositionNode.GEOMETRY ) {

			outputNode = new AttributeNode( 'position', 'vec3' );

		} else if ( scope === PositionNode.LOCAL ) {

			outputNode = new VaryNode( new PositionNode( PositionNode.GEOMETRY ) );

		} else if ( scope === PositionNode.WORLD ) {

			const vertexPositionNode = new MathNode( MathNode.TRANSFORM_DIRECTION, new ModelNode( ModelNode.WORLD_MATRIX ), new PositionNode( PositionNode.LOCAL ) );
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
