import Node from '../core/Node.js';
import CameraNode from '../accessors/CameraNode.js';
import ModelNode from '../accessors/ModelNode.js';
import OperatorNode from '../math/OperatorNode.js';
import PositionNode from '../accessors/PositionNode.js';

class ModelViewProjectionNode extends Node {

	constructor( position = new PositionNode() ) {

		super( 'vec4' );

		this.position = position;

		this._mvpMatrix = new OperatorNode( '*', new CameraNode( CameraNode.PROJECTION_MATRIX ), new ModelNode( ModelNode.VIEW_MATRIX ) );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const mvpSnipped = this._mvpMatrix.build( builder );
		const positionSnipped = this.position.build( builder, 'vec3' );

		return builder.format( `( ${mvpSnipped} * vec4( ${positionSnipped}, 1.0 ) )`, type, output );

	}

}

export default ModelViewProjectionNode;
