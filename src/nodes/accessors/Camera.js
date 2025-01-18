import { uniform } from '../core/UniformNode.js';
import { renderGroup, sharedUniformGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { Fn } from '../tsl/TSLBase.js';
import { uniformArray } from './UniformArrayNode.js';

/** @module Camera **/

/**
 * TSL object that represents the current `index` value of the camera if used ArrayCamera.
 *
 * @type {UniformNode<uint>}
 */
export const cameraIndex = /*@__PURE__*/ uniform( 0, 'uint' ).setGroup( sharedUniformGroup( 'cameraIndex' ) ).toVarying( 'v_cameraIndex' );

/**
 * TSL object that represents the `near` value of the camera used for the current render.
 *
 * @type {UniformNode<float>}
 */
export const cameraNear = /*@__PURE__*/ uniform( 'float' ).label( 'cameraNear' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.near );

/**
 * TSL object that represents the `far` value of the camera used for the current render.
 *
 * @type {UniformNode<float>}
 */
export const cameraFar = /*@__PURE__*/ uniform( 'float' ).label( 'cameraFar' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.far );

/**
 * TSL object that represents the projection matrix of the camera used for the current render.
 *
 * @type {UniformNode<mat4>}
 */
export const cameraProjectionMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraProjectionMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.projectionMatrix );

		}

		const cameraProjectionMatrices = uniformArray( matrices ).setGroup( renderGroup ).label( 'cameraProjectionMatrices' );

		cameraProjectionMatrix = cameraProjectionMatrices.element( cameraIndex ).toVar( 'cameraProjectionMatrix' );

	} else {

		cameraProjectionMatrix = uniform( 'mat4' ).label( 'cameraProjectionMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );

	}

	return cameraProjectionMatrix;

} ).once() )();

/**
 * TSL object that represents the inverse projection matrix of the camera used for the current render.
 *
 * @type {UniformNode<mat4>}
 */
export const cameraProjectionMatrixInverse = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraProjectionMatrixInverse' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );

/**
 * TSL object that represents the view matrix of the camera used for the current render.
 *
 * @type {UniformNode<mat4>}
 */
export const cameraViewMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraViewMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.matrixWorldInverse );

		}

		const cameraViewMatrices = uniformArray( matrices ).setGroup( renderGroup ).label( 'cameraViewMatrices' );

		cameraViewMatrix = cameraViewMatrices.element( cameraIndex ).toVar( 'cameraViewMatrix' );

	} else {

		cameraViewMatrix = uniform( 'mat4' ).label( 'cameraViewMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );

	}

	return cameraViewMatrix;

} ).once() )();

/**
 * TSL object that represents the world matrix of the camera used for the current render.
 *
 * @type {UniformNode<mat4>}
 */
export const cameraWorldMatrix = /*@__PURE__*/ uniform( 'mat4' ).label( 'cameraWorldMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );

/**
 * TSL object that represents the normal matrix of the camera used for the current render.
 *
 * @type {UniformNode<mat3>}
 */
export const cameraNormalMatrix = /*@__PURE__*/ uniform( 'mat3' ).label( 'cameraNormalMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );

/**
 * TSL object that represents the position in world space of the camera used for the current render.
 *
 * @type {UniformNode<vec3>}
 */
export const cameraPosition = /*@__PURE__*/ uniform( new Vector3() ).label( 'cameraPosition' ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );
