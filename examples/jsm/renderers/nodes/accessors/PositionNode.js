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

	constructor( scope = PositionNode.POSITION ) {

		super( 'vec3' );

		this.scope = scope;

	}

	generate( builder, output ) {

		const type = this.getType( builder );
		const nodeData = builder.getDataFromNode( this );
		const scope = this.scope;

		let localPositionNode = nodeData.localPositionNode;

		if ( localPositionNode === undefined ) {

			localPositionNode = new AttributeNode( 'position', 'vec3' );

			nodeData.localPositionNode = localPositionNode;

		}

		let outputNode = localPositionNode;

		if ( scope === PositionNode.WORLD ) {

			let worldPositionNode = nodeData.worldPositionNode;

			if ( worldPositionNode === undefined ) {

				const vertexPositionNode = transformDirection.call( { dir: localPositionNode, matrix: new ModelNode( ModelNode.WORLD_MATRIX ) } );

				worldPositionNode = new VaryNode( vertexPositionNode );

				nodeData.worldPositionNode = worldPositionNode;

			}

			outputNode = worldPositionNode;

		} else if ( scope === PositionNode.VIEW ) {

			let viewPositionNode = nodeData.viewPositionNode;

			if ( viewPositionNode === undefined ) {

				const vertexPositionNode = new OperatorNode( '*', new ModelNode( ModelNode.VIEW_MATRIX ), localPositionNode );

				viewPositionNode = new VaryNode( vertexPositionNode );

				nodeData.viewPositionNode = viewPositionNode;

			}

			outputNode = viewPositionNode;

		} else if ( scope === PositionNode.VIEW_DIRECTION ) {

			let viewDirPositionNode = nodeData.viewDirPositionNode;

			if ( viewDirPositionNode === undefined ) {

				const vertexPositionNode = new MathNode( MathNode.NEGATE, new PositionNode( PositionNode.VIEW ) );

				viewDirPositionNode = new MathNode( MathNode.NORMALIZE, new VaryNode( vertexPositionNode ) );

				nodeData.viewDirPositionNode = viewDirPositionNode;

			}

			outputNode = viewDirPositionNode;

		}

		const positionSnipped = outputNode.build( builder, type );

		return builder.format( positionSnipped, type, output );

	}

}

export default PositionNode;
