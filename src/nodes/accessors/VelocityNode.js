import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { modelWorldMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { uniform } from '../core/UniformNode.js';
import { sub } from '../math/OperatorNode.js';

const _worldMatrixCache = new WeakMap();

class VelocityNode extends TempNode {

	constructor() {

		super( 'vec2' );

		this.updateType = NodeUpdateType.OBJECT;
		this.updateAfterType = NodeUpdateType.OBJECT;

		this.previousProjectionViewMatrix = uniform( new Matrix4() );
		this.currentProjectionViewMatrix = uniform( new Matrix4() );
		this.previousModelMatrix = uniform( new Matrix4() );

		this.firstFrame = true;

	}

	update( frame ) {

		const camera = frame.camera;
		const object = frame.object;

		if ( this.firstFrame ) {

			this.firstFrame = false;

			this.currentProjectionViewMatrix.value.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
			this.previousProjectionViewMatrix.value.copy( this.currentProjectionViewMatrix.value );

			this.previousModelMatrix.value.copy( object.matrixWorld );

		} else {

			this.previousProjectionViewMatrix.value.copy( this.currentProjectionViewMatrix.value );
			this.currentProjectionViewMatrix.value.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

			const previousModelMatrix = getPreviousModelMatrix( object );
			this.previousModelMatrix.value.copy( previousModelMatrix );

		}

	}

	updateAfter( frame ) {

		const object = frame.object;

		const previousModelMatrix = getPreviousModelMatrix( object );

		previousModelMatrix.copy( object.matrixWorld );

	}

	setup( /*builder*/ ) {

		this.firstFrame = true;

		const clipPositionCurrent = this.currentProjectionViewMatrix.mul( modelWorldMatrix ).mul( positionLocal ).toVar();
		const clipPositionPrevious = this.previousProjectionViewMatrix.mul( this.previousModelMatrix ).mul( positionLocal ).toVar();

		const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
		const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );

		const velocity = sub( ndcPositionCurrent, ndcPositionPrevious );

		return velocity;

	}

}

function getPreviousModelMatrix( object ) {

	let previousModelMatrix = _worldMatrixCache.get( object );

	if ( previousModelMatrix === undefined ) {

		previousModelMatrix = new Matrix4();
		_worldMatrixCache.set( object, previousModelMatrix );

	}

	return previousModelMatrix;

}

export default VelocityNode;

export const velocity = nodeImmutable( VelocityNode );

addNodeClass( 'VelocityNode', VelocityNode );
