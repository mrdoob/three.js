import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { uniform } from '../core/UniformNode.js';
import { sub } from '../math/OperatorNode.js';
import { cameraProjectionMatrix } from './CameraNode.js';

const _matrixCache = new WeakMap();

class VelocityNode extends TempNode {

	constructor( previousPositionNode ) {

		super( 'vec2' );

		this.updateType = NodeUpdateType.OBJECT;
		this.updateAfterType = NodeUpdateType.OBJECT;

		this.previousPositionNode = previousPositionNode;

		this.previousProjectionMatrix = uniform( new Matrix4() );
		this.previousModelViewMatrix = uniform( new Matrix4() );

	}

	update( { camera, object } ) {

		const previousModelMatrix = getPreviousMatrix( object );
		const previousCameraMatrix = getPreviousMatrix( camera );

		this.previousModelViewMatrix.value.copy( previousModelMatrix );
		this.previousProjectionMatrix.value.copy( previousCameraMatrix );

	}

	updateAfter( { camera, object } ) {

		const previousModelMatrix = getPreviousMatrix( object );
		const previousCameraMatrix = getPreviousMatrix( camera );

		previousModelMatrix.copy( object.modelViewMatrix );
		previousCameraMatrix.copy( camera.projectionMatrix );

	}

	setup( /*builder*/ ) {

		const positionLocalPrevious = this.previousPositionNode;

		const clipPositionCurrent = cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionLocal );
		const clipPositionPrevious = cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionLocalPrevious );
		//const clipPositionPrevious = this.previousProjectionMatrix.mul( this.previousModelViewMatrix ).mul( positionLocalPrevious );

		const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
		const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

		const velocity = sub( ndcPositionCurrent, ndcPositionPrevious );

		return velocity;

	}

}

function getPreviousMatrix( object ) {

	let previousMatrix = _matrixCache.get( object );

	if ( previousMatrix === undefined ) {

		previousMatrix = new Matrix4();
		_matrixCache.set( object, previousMatrix );

	}

	return previousMatrix;

}

export default VelocityNode;

export const velocity = nodeProxy( VelocityNode );

addNodeClass( 'VelocityNode', VelocityNode );
