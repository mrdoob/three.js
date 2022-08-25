import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryingNode from '../core/VaryingNode.js';
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

			outputNode = new VaryingNode( new PositionNode( PositionNode.GEOMETRY ) );

		} else if ( scope === PositionNode.WORLD ) {

			const vertexPositionNode = new MathNode( MathNode.TRANSFORM_DIRECTION, new ModelNode( ModelNode.WORLD_MATRIX ), new PositionNode( PositionNode.LOCAL ) );
			outputNode = new VaryingNode( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW ) {

			const vertexPositionNode = new OperatorNode( '*', new ModelNode( ModelNode.VIEW_MATRIX ), new PositionNode( PositionNode.LOCAL ) );
			outputNode = new VaryingNode( vertexPositionNode );

		} else if ( scope === PositionNode.VIEW_DIRECTION ) {

			const vertexPositionNode = new MathNode( MathNode.NEGATE, new PositionNode( PositionNode.VIEW ) );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryingNode( vertexPositionNode ) );

		}

		return outputNode.build( builder, this.getNodeType( builder ) );

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

export default PositionNode;
