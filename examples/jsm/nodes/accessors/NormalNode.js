import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import VaryNode from '../core/VaryNode.js';
import ModelNode from '../accessors/ModelNode.js';
import CameraNode from '../accessors/CameraNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';

class NormalNode extends Node {

	static Geometry = 'geometry';
	static Local = 'local';
	static World = 'world';
	static View = 'view';

	constructor( scope = NormalNode.Local ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `normal-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === NormalNode.Geometry ) {

			outputNode = new AttributeNode( 'normal', 'vec3' );

		} else if ( scope === NormalNode.Local ) {

			outputNode = new VaryNode( new NormalNode( NormalNode.Geometry ) );

		} else if ( scope === NormalNode.View ) {

			const vertexNormalNode = new OperatorNode( '*', new ModelNode( ModelNode.NormalMatrix ), new NormalNode( NormalNode.Local ) );
			outputNode = new MathNode( MathNode.Normalize, new VaryNode( vertexNormalNode ) );

		} else if ( scope === NormalNode.World ) {

			// To use INVERSE_TRANSFORM_DIRECTION only inverse the param order like this: MathNode( ..., Vector, Matrix );
			const vertexNormalNode = new MathNode( MathNode.TransformDirection, new NormalNode( NormalNode.View ), new CameraNode( CameraNode.ViewMatrix ) );
			outputNode = new MathNode( MathNode.Normalize, new VaryNode( vertexNormalNode ) );

		}

		return outputNode.build( builder );

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

export default NormalNode;
