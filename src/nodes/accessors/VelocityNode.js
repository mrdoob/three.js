import TempNode from '../core/TempNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { positionLocal, positionPrevious } from './Position.js';
import { nodeImmutable } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { uniform } from '../core/UniformNode.js';
import { sub } from '../math/OperatorNode.js';
import { cameraProjectionMatrix } from './Camera.js';
import { renderGroup } from '../core/UniformGroupNode.js';

const _objectData = new WeakMap();

class VelocityNode extends TempNode {

	static get type() {

		return 'VelocityNode';

	}

	constructor() {

		super( 'vec2' );

		this.updateType = NodeUpdateType.OBJECT;
		this.updateAfterType = NodeUpdateType.OBJECT;

		this.previousModelWorldMatrix = uniform( new Matrix4() );
		this.previousProjectionMatrix = uniform( new Matrix4() ).setGroup( renderGroup );
		this.previousCameraViewMatrix = uniform( new Matrix4() );

	}

	update( { frameId, camera, object } ) {

		const previousModelMatrix = getPreviousMatrix( object );

		this.previousModelWorldMatrix.value.copy( previousModelMatrix );

		//

		const cameraData = getData( camera );

		if ( cameraData.frameId !== frameId ) {

			cameraData.frameId = frameId;

			if ( cameraData.previousProjectionMatrix === undefined ) {

				cameraData.previousProjectionMatrix = new Matrix4();
				cameraData.previousCameraViewMatrix = new Matrix4();

				cameraData.currentProjectionMatrix = new Matrix4();
				cameraData.currentCameraViewMatrix = new Matrix4();

				cameraData.previousProjectionMatrix.copy( camera.projectionMatrix );
				cameraData.previousCameraViewMatrix.copy( camera.matrixWorldInverse );

			} else {

				cameraData.previousProjectionMatrix.copy( cameraData.currentProjectionMatrix );
				cameraData.previousCameraViewMatrix.copy( cameraData.currentCameraViewMatrix );

			}

			cameraData.currentProjectionMatrix.copy( camera.projectionMatrix );
			cameraData.currentCameraViewMatrix.copy( camera.matrixWorldInverse );

			this.previousProjectionMatrix.value.copy( cameraData.previousProjectionMatrix );
			this.previousCameraViewMatrix.value.copy( cameraData.previousCameraViewMatrix );

		}

	}

	updateAfter( { object } ) {

		getPreviousMatrix( object ).copy( object.matrixWorld );

	}

	setup( /*builder*/ ) {

		const previousModelViewMatrix = this.previousCameraViewMatrix.mul( this.previousModelWorldMatrix );

		const clipPositionCurrent = cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionLocal );
		const clipPositionPrevious = this.previousProjectionMatrix.mul( previousModelViewMatrix ).mul( positionPrevious );

		const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
		const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

		const velocity = sub( ndcPositionCurrent, ndcPositionPrevious );

		return velocity;

	}

}

function getData( object ) {

	let objectData = _objectData.get( object );

	if ( objectData === undefined ) {

		objectData = {};
		_objectData.set( object, objectData );

	}

	return objectData;

}

function getPreviousMatrix( object, index = 0 ) {

	const objectData = getData( object );

	let matrix = objectData[ index ];

	if ( matrix === undefined ) {

		objectData[ index ] = matrix = new Matrix4();

	}

	return matrix;

}

export default VelocityNode;

export const velocity = /*@__PURE__*/ nodeImmutable( VelocityNode );
