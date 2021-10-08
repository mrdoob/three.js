import Node from '../core/Node.js';
import AttributeNode from '../core/AttributeNode.js';
import NodeKeywords from '../core/NodeKeywords.js';
import VaryNode from '../core/VaryNode.js';
import ModelNode from '../accessors/ModelNode.js';
import CameraNode from '../accessors/CameraNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import { inverseTransformDirection } from '../functions/MathFunctions.js';

class NormalNode extends Node {

	static GEOMETRY = 'geometry';
	static LOCAL = 'local';
	static WORLD = 'world';
	static VIEW = 'view';

	constructor( scope = NormalNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

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

			outputNode = new VaryNode( new NormalNode( NormalNode.GEOMETRY ) );

		} else if ( scope === NormalNode.VIEW ) {

			const vertexNormalNode = new OperatorNode( '*', new ModelNode( ModelNode.NORMAL_MATRIX ), new NormalNode( NormalNode.LOCAL ) );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryNode( vertexNormalNode ) );

		} else if ( scope === NormalNode.WORLD ) {

			const vertexNormalNode = inverseTransformDirection.call( { dir: new NormalNode( NormalNode.VIEW ), matrix: new CameraNode( CameraNode.VIEW_MATRIX ) } );
			outputNode = new MathNode( MathNode.NORMALIZE, new VaryNode( vertexNormalNode ) );

		}

		return outputNode.build( builder );

	}

}

export default NormalNode;
