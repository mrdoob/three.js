import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { modelWorldMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';
import { NodeUpdateType } from '../core/constants.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { uniform } from '../core/UniformNode.js';
import { sub } from '../math/OperatorNode.js';

const _worldMatrixCache = new WeakMap();

class VelocityNode extends TempNode {

	constructor() {

		super( 'vec2' );

		this.updateBeforeType = NodeUpdateType.OBJECT;
		this.updateAfterType = NodeUpdateType.OBJECT;

		this.previousProjectionViewMatrix = uniform( new Matrix4() );
		this.currentProjectionViewMatrix = uniform( new Matrix4() );
		this.previousModelMatrix = uniform( new Matrix4() );

	}

	updateBefore( frame ) {

		const camera = frame.camera;
		const object = frame.object;

		this.previousProjectionViewMatrix.value.copy( this.currentProjectionViewMatrix.value );
		this.currentProjectionViewMatrix.value.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

		const previousModelMatrix = getPreviousModelMatrix( object );
		this.previousModelMatrix.value.copy( previousModelMatrix );

	}

	updateAfter( frame ) {

		const object = frame.object;

		const previousModelMatrix = getPreviousModelMatrix( object );

		previousModelMatrix.copy( object.matrixWorld );

	}

	setup( /*builder*/ ) {

		const clipPositionCurrent = this.currentProjectionViewMatrix.mul( modelWorldMatrix ).mul( positionLocal ).toVar();
		const clipPositionPrevious = this.previousProjectionViewMatrix.mul( this.previousModelMatrix ).mul( positionLocal ).toVar();

		const ndcPositionCurrent = clipPositionCurrent.xy.div( clipPositionCurrent.w );
		const ndcPositionPrevious = clipPositionPrevious.xy.div( clipPositionPrevious.w );
		let velocity = sub( ndcPositionCurrent, ndcPositionPrevious ).mul( 0.5 );
		velocity = velocity.mul( 0.5 ).add( 0.5 );

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

export const velocity = nodeProxy( VelocityNode );

addNodeClass( 'VelocityNode', VelocityNode );
