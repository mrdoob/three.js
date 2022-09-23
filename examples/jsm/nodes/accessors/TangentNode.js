import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryingNode from '../core/VaryingNode.js';
import ModelNode from '../accessors/ModelNode.js';
import CameraNode from '../accessors/CameraNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import SplitNode from '../utils/SplitNode.js';

class TangentNode extends Node {

	static GEOMETRY = 'geometry';
	static LOCAL = 'local';
	static VIEW = 'view';
	static WORLD = 'world';

	constructor( scope = TangentNode.LOCAL ) {

		super();

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `tangent-${this.scope}`;

	}

	getNodeType() {

		const scope = this.scope;

		if ( scope === TangentNode.GEOMETRY ) {

			return 'vec4';

		}

		return 'vec3';

	}


	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === TangentNode.GEOMETRY ) {

			outputNode = new AttributeNode( 'tangent', 'vec4' );

		} else if ( scope === TangentNode.LOCAL ) {

			outputNode = new VaryingNode( new SplitNode( new TangentNode( TangentNode.GEOMETRY ), 'xyz' ) );

		} else if ( scope === TangentNode.VIEW ) {

			const vertexNode = new SplitNode( new OperatorNode( '*', new ModelNode( ModelNode.VIEW_MATRIX ), new TangentNode( TangentNode.LOCAL ) ), 'xyz' );

			outputNode = new MathNode( MathNode.NORMALIZE, new VaryingNode( vertexNode ) );

		} else if ( scope === TangentNode.WORLD ) {

			const vertexNode = new MathNode( MathNode.TRANSFORM_DIRECTION, new TangentNode( TangentNode.VIEW ), new CameraNode( CameraNode.VIEW_MATRIX ) );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryingNode( vertexNode ) );

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

export default TangentNode;
