import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';

class PositionNode extends Node {

	static LOCAL = 'local';

	constructor( scope = PositionNode.POSITION ) {

		super( 'vec3' );

		this.scope = scope;

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const nodeData = builder.getDataFromNode( this, builder.shaderStage );

		let positionNode = nodeData.positionNode;

		if ( positionNode === undefined ) {

			positionNode = new AttributeNode( 'position', 'vec3' );

			nodeData.positionNode = positionNode;

		}

		const positionSnipped = positionNode.build( builder, type );

		return builder.format( positionSnipped, type, output );

	}

}

export default PositionNode;
