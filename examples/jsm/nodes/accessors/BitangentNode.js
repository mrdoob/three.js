import Node from '../core/Node.js';
import VaryingNode from '../core/VaryingNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import SplitNode from '../utils/SplitNode.js';
import NormalNode from './NormalNode.js';
import TangentNode from './TangentNode.js';

class BitangentNode extends Node {

	static GEOMETRY = 'geometry';
	static LOCAL = 'local';
	static VIEW = 'view';
	static WORLD = 'world';

	constructor( scope = BitangentNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `bitangent-${this.scope}`;

	}

	generate( builder ) {

		const scope = this.scope;

		const crossNormalTangent = new MathNode( MathNode.CROSS, new NormalNode( scope ), new TangentNode( scope ) );
		const tangentW = new SplitNode( new TangentNode( TangentNode.GEOMETRY ), 'w' );
		const vertexNode = new SplitNode( new OperatorNode( '*', crossNormalTangent, tangentW ), 'xyz' );

		const outputNode = new MathNode( MathNode.NORMALIZE, new VaryingNode( vertexNode ) );

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

export default BitangentNode;
