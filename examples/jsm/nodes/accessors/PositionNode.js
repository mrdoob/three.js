import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryNode from '../core/VaryNode.js';
import ModelNode from '../accessors/ModelNode.js';
import MathNode from '../math/MathNode.js';
import OperatorNode from '../math/OperatorNode.js';

class PositionNode extends Node {

	static Geometry = 'geometry';
	static Local = 'local';
	static World = 'world';
	static View = 'view';
	static ViewDirection = 'viewDirection';

	constructor( scope = PositionNode.Local ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `position-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === PositionNode.Geometry ) {

			outputNode = new AttributeNode( 'position', 'vec3' );

		} else if ( scope === PositionNode.Local ) {

			outputNode = new VaryNode( new PositionNode( PositionNode.Geometry ) );

		} else if ( scope === PositionNode.World ) {

			const vertexPositionNode = new MathNode( MathNode.TransformDirection, new ModelNode( ModelNode.WorldMatrix ), new PositionNode( PositionNode.Local ) );
			outputNode = new VaryNode( vertexPositionNode );

		} else if ( scope === PositionNode.View ) {

			const vertexPositionNode = new OperatorNode( '*', new ModelNode( ModelNode.ViewMatrix ), new PositionNode( PositionNode.Local ) );
			outputNode = new VaryNode( vertexPositionNode );

		} else if ( scope === PositionNode.ViewDirection ) {

			const vertexPositionNode = new MathNode( MathNode.Negate, new PositionNode( PositionNode.View ) );
			outputNode = new MathNode( MathNode.Normalize, new VaryNode( vertexPositionNode ) );

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
