import Object3DNode from './Object3DNode.js';
import { Fn, nodeImmutable } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';

import { Matrix4 } from '../../math/Matrix4.js';
import { cameraViewMatrix } from './Camera.js';
import { Matrix3 } from '../../math/Matrix3.js';

/**
 * This type of node is a specialized version of `Object3DNode`
 * with larger set of model related metrics. Unlike `Object3DNode`,
 * `ModelNode` extracts the reference to the 3D object from the
 * current node frame state.
 *
 * @augments Object3DNode
 */
class ModelNode extends Object3DNode {

	static get type() {

		return 'ModelNode';

	}

	/**
	 * Constructs a new object model node.
	 *
	 * @param {('position'|'viewPosition'|'direction'|'scale'|'worldMatrix')} scope - The node represents a different type of transformation depending on the scope.
	 */
	constructor( scope ) {

		super( scope );

	}

	/**
	 * Extracts the model reference from the frame state and then
	 * updates the uniform value depending on the scope.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

export default ModelNode;

/**
 * TSL object that represents the object's direction in world space.
 *
 * @tsl
 * @type {ModelNode<vec3>}
 */
export const modelDirection = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.DIRECTION );

/**
 * TSL object that represents the object's world matrix.
 *
 * @tsl
 * @type {ModelNode<mat4>}
 */
export const modelWorldMatrix = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );

/**
 * TSL object that represents the object's position in world space.
 *
 * @tsl
 * @type {ModelNode<vec3>}
 */
export const modelPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.POSITION );

/**
 * TSL object that represents the object's scale in world space.
 *
 * @tsl
 * @type {ModelNode<vec3>}
 */
export const modelScale = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.SCALE );

/**
 * TSL object that represents the object's position in view/camera space.
 *
 * @tsl
 * @type {ModelNode<vec3>}
 */
export const modelViewPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

/**
 * TSL object that represents the object's radius.
 *
 * @tsl
 * @type {ModelNode<float>}
 */
export const modelRadius = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.RADIUS );

/**
 * TSL object that represents the object's normal matrix.
 *
 * @tsl
 * @type {UniformNode<mat3>}
 */
export const modelNormalMatrix = /*@__PURE__*/ uniform( new Matrix3() ).onObjectUpdate( ( { object }, self ) => self.value.getNormalMatrix( object.matrixWorld ) );

/**
 * TSL object that represents the object's inverse world matrix.
 *
 * @tsl
 * @type {UniformNode<mat4>}
 */
export const modelWorldMatrixInverse = /*@__PURE__*/ uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ).invert() );

/**
 * TSL object that represents the object's model view matrix.
 *
 * @tsl
 * @type {Node<mat4>}
 */
export const modelViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	return builder.context.modelViewMatrix || mediumpModelViewMatrix;

} ).once() )().toVar( 'modelViewMatrix' );

// GPU Precision

/**
 * TSL object that represents the object's model view in `mediump` precision.
 *
 * @tsl
 * @type {Node<mat4>}
 */
export const mediumpModelViewMatrix = /*@__PURE__*/ cameraViewMatrix.mul( modelWorldMatrix );

// CPU Precision

/**
 * TSL object that represents the object's model view in `highp` precision
 * which is achieved by computing the matrix in JS and not in the shader.
 *
 * @tsl
 * @type {Node<mat4>}
 */
export const highpModelViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	builder.context.isHighPrecisionModelViewMatrix = true;

	return uniform( 'mat4' ).onObjectUpdate( ( { object, camera } ) => {

		return object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

	} );

} ).once() )().toVar( 'highpModelViewMatrix' );

/**
 * TSL object that represents the object's model normal view in `highp` precision
 * which is achieved by computing the matrix in JS and not in the shader.
 *
 * @tsl
 * @type {Node<mat3>}
 */
export const highpModelNormalViewMatrix = /*@__PURE__*/ ( Fn( ( builder ) => {

	const isHighPrecisionModelViewMatrix = builder.context.isHighPrecisionModelViewMatrix;

	return uniform( 'mat3' ).onObjectUpdate( ( { object, camera } ) => {

		if ( isHighPrecisionModelViewMatrix !== true ) {

			object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );

		}

		return object.normalMatrix.getNormalMatrix( object.modelViewMatrix );

	} );

} ).once() )().toVar( 'highpModelNormalViewMatrix' );
