import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryingNode from '../core/VaryingNode.js';
import ModelNode from '../accessors/ModelNode.js';
import CameraNode from '../accessors/CameraNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';

class NormalNode extends Node {

	constructor( scope = NormalNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	isGlobal() {

		return true;

	}

	getHash( /*builder*/ ) {

		return `normal-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === NormalNode.GEOMETRY ) {

			outputNode = new AttributeNode( 'normal', 'vec3' );

		} else if ( scope === NormalNode.LOCAL ) {

			outputNode = new VaryingNode( new NormalNode( NormalNode.GEOMETRY ) );

		} else if ( scope === NormalNode.VIEW ) {

			const vertexNode = new OperatorNode( '*', new ModelNode( ModelNode.NORMAL_MATRIX ), new NormalNode( NormalNode.LOCAL ) );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryingNode( vertexNode ) );

		} else if ( scope === NormalNode.WORLD ) {

			// To use INVERSE_TRANSFORM_DIRECTION only inverse the param order like this: MathNode( ..., Vector, Matrix );
			const vertexNode = new MathNode( MathNode.TRANSFORM_DIRECTION, new NormalNode( NormalNode.VIEW ), new CameraNode( CameraNode.VIEW_MATRIX ) );
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

NormalNode.GEOMETRY = 'geometry';
NormalNode.LOCAL = 'local';
NormalNode.VIEW = 'view';
NormalNode.WORLD = 'world';

export default NormalNode;
