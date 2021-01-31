import Node from '../core/Node.js';
import CameraNode from '../accessors/CameraNode.js';
import ModelNode from '../accessors/ModelNode.js';
import OperatorNode from '../math/OperatorNode.js';
import PositionNode from '../accessors/PositionNode.js';

class WVPNode extends Node {

	constructor( position = new PositionNode() ) {

		super( 'vec4' );

		this.position = position;

		this._wvpMatrix = new OperatorNode( '*', new CameraNode( CameraNode.PROJECTION ), new ModelNode( ModelNode.VIEW ) );

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const wvpSnipped = this._wvpMatrix.build( builder );
		const positionSnipped = this.position.build( builder, 'vec3' );

		return builder.format( `( ${wvpSnipped} * vec4( ${positionSnipped}, 1.0 ) )`, type, output );

	}

}

export default WVPNode;
