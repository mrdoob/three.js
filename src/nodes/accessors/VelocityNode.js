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

/** @module VelocityNode **/

/**
 * A node for representing motion or velocity vectors. Foundation
 * for advanced post processing effects like motion blur or TRAA.
 *
 * The node keeps track of the model, view and projection matrices
 * of the previous frame and uses them to compute offsets in NDC space.
 * These offsets represent the final velocity.
 *
 * @augments TempNode
 */
class VelocityNode extends TempNode {

	static get type() {

		return 'VelocityNode';

	}

	/**
	 * Constructs a new vertex color node.
	 */
	constructor() {

		super( 'vec2' );

		/**
		 * The current projection matrix.
		 *
		 * @type {Matrix4?}
		 * @default null
		 */
		this.projectionMatrix = null;

		/**
		 * Overwritten since velocity nodes are updated per object.
		 *
		 * @type {String}
		 * @default 'object'
		 */
		this.updateType = NodeUpdateType.OBJECT;

		/**
		 * Overwritten since velocity nodes save data after the update.
		 *
		 * @type {String}
		 * @default 'object'
		 */
		this.updateAfterType = NodeUpdateType.OBJECT;

		/**
		 * Uniform node representing the previous model matrix in world space.
		 *
		 * @type {UniformNode<mat4>}
		 * @default null
		 */
		this.previousModelWorldMatrix = uniform( new Matrix4() );

		/**
		 * Uniform node representing the previous projection matrix.
		 *
		 * @type {UniformNode<mat4>}
		 * @default null
		 */
		this.previousProjectionMatrix = uniform( new Matrix4() ).setGroup( renderGroup );

		/**
		 * Uniform node representing the previous view matrix.
		 *
		 * @type {UniformNode<mat4>}
		 * @default null
		 */
		this.previousCameraViewMatrix = uniform( new Matrix4() );

	}

	/**
	 * Sets the given projection matrix.
	 *
	 * @param {Matrix4} projectionMatrix - The projection matrix to set.
	 */
	setProjectionMatrix( projectionMatrix ) {

		this.projectionMatrix = projectionMatrix;

	}

	/**
	 * Updates velocity specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
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

				cameraData.previousProjectionMatrix.copy( this.projectionMatrix || camera.projectionMatrix );
				cameraData.previousCameraViewMatrix.copy( camera.matrixWorldInverse );

			} else {

				cameraData.previousProjectionMatrix.copy( cameraData.currentProjectionMatrix );
				cameraData.previousCameraViewMatrix.copy( cameraData.currentCameraViewMatrix );

			}

			cameraData.currentProjectionMatrix.copy( this.projectionMatrix || camera.projectionMatrix );
			cameraData.currentCameraViewMatrix.copy( camera.matrixWorldInverse );

			this.previousProjectionMatrix.value.copy( cameraData.previousProjectionMatrix );
			this.previousCameraViewMatrix.value.copy( cameraData.previousCameraViewMatrix );

		}

	}

	/**
	 * Overwritten to updated velocity specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateAfter( { object } ) {

		getPreviousMatrix( object ).copy( object.matrixWorld );

	}

	/**
	 * Implements the velocity computation based on the previous and current vertex data.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Node<vec2>} The motion vector.
	 */
	setup( /*builder*/ ) {

		const projectionMatrix = ( this.projectionMatrix === null ) ? cameraProjectionMatrix : uniform( this.projectionMatrix );

		const previousModelViewMatrix = this.previousCameraViewMatrix.mul( this.previousModelWorldMatrix );

		const clipPositionCurrent = projectionMatrix.mul( modelViewMatrix ).mul( positionLocal );
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

/**
 * TSL object that represents the velocity of a render pass.
 *
 * @type {VelocityNode}
 */
export const velocity = /*@__PURE__*/ nodeImmutable( VelocityNode );
