import { uniform } from '../core/UniformNode.js';
import { renderGroup, sharedUniformGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { Fn, vec4 } from '../tsl/TSLBase.js';
import { uniformArray } from './UniformArrayNode.js';
import { builtin } from './BuiltinNode.js';
import { screenSize } from '../display/ScreenNode.js';

/**
 * TSL object that represents the current `index` value of the camera if used ArrayCamera.
 *
 * @tsl
 * @type {UniformNode<uint>}
 */
export const cameraIndex = /*@__PURE__*/ uniform( 0, 'uint' ).setName( 'u_cameraIndex' ).setGroup( sharedUniformGroup( 'cameraIndex' ) ).toVarying( 'v_cameraIndex' );

/**
 * TSL object that represents the `near` value of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const cameraNear = /*@__PURE__*/ uniform( 'float' ).setName( 'cameraNear' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.near );

/**
 * TSL object that represents the `far` value of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const cameraFar = /*@__PURE__*/ uniform( 'float' ).setName( 'cameraFar' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.far );

/**
 * TSL object that represents the projection matrix of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<mat4>}
 */
export const cameraProjectionMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraProjectionMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.projectionMatrix );

		}

		const cameraProjectionMatrices = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraProjectionMatrices' );

		cameraProjectionMatrix = cameraProjectionMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraProjectionMatrix' );

	} else {

		cameraProjectionMatrix = uniform( 'mat4' ).setName( 'cameraProjectionMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );

	}

	return cameraProjectionMatrix;

} ).once() )();

/**
 * TSL object that represents the inverse projection matrix of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<mat4>}
 */
export const cameraProjectionMatrixInverse = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraProjectionMatrixInverse;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.projectionMatrixInverse );

		}

		const cameraProjectionMatricesInverse = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraProjectionMatricesInverse' );

		cameraProjectionMatrixInverse = cameraProjectionMatricesInverse.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraProjectionMatrixInverse' );

	} else {

		cameraProjectionMatrixInverse = uniform( 'mat4' ).setName( 'cameraProjectionMatrixInverse' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );

	}

	return cameraProjectionMatrixInverse;

} ).once() )();

/**
 * TSL object that represents the view matrix of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<mat4>}
 */
export const cameraViewMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraViewMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.matrixWorldInverse );

		}

		const cameraViewMatrices = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraViewMatrices' );

		cameraViewMatrix = cameraViewMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraViewMatrix' );

	} else {

		cameraViewMatrix = uniform( 'mat4' ).setName( 'cameraViewMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );

	}

	return cameraViewMatrix;

} ).once() )();

/**
 * TSL object that represents the world matrix of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<mat4>}
 */
export const cameraWorldMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraWorldMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.matrixWorld );

		}

		const cameraWorldMatrices = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraWorldMatrices' );

		cameraWorldMatrix = cameraWorldMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraWorldMatrix' );

	} else {

		cameraWorldMatrix = uniform( 'mat4' ).setName( 'cameraWorldMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );

	}

	return cameraWorldMatrix;

} ).once() )();

/**
 * TSL object that represents the normal matrix of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<mat3>}
 */
export const cameraNormalMatrix = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraNormalMatrix;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.normalMatrix );

		}

		const cameraNormalMatrices = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraNormalMatrices' );

		cameraNormalMatrix = cameraNormalMatrices.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraNormalMatrix' );

	} else {

		cameraNormalMatrix = uniform( 'mat3' ).setName( 'cameraNormalMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );

	}

	return cameraNormalMatrix;

} ).once() )();

/**
 * TSL object that represents the position in world space of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<vec3>}
 */
export const cameraPosition = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraPosition;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const positions = [];

		for ( let i = 0, l = camera.cameras.length; i < l; i ++ ) {

			positions.push( new Vector3() );

		}

		const cameraPositions = uniformArray( positions ).setGroup( renderGroup ).setName( 'cameraPositions' ).onRenderUpdate( ( { camera }, self ) => {

			const subCameras = camera.cameras;
			const array = self.array;

			for ( let i = 0, l = subCameras.length; i < l; i ++ ) {

				array[ i ].setFromMatrixPosition( subCameras[ i ].matrixWorld );

			}

		} );

		cameraPosition = cameraPositions.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraPosition' );

	} else {

		cameraPosition = uniform( new Vector3() ).setName( 'cameraPosition' ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );

	}

	return cameraPosition;

} ).once() )();


/**
 * TSL object that represents the viewport of the camera used for the current render.
 *
 * @tsl
 * @type {UniformNode<vec4>}
 */
export const cameraViewport = /*@__PURE__*/ ( Fn( ( { camera } ) => {

	let cameraViewport;

	if ( camera.isArrayCamera && camera.cameras.length > 0 ) {

		const viewports = [];

		for ( const subCamera of camera.cameras ) {

			viewports.push( subCamera.viewport );

		}

		const cameraViewports = uniformArray( viewports, 'vec4' ).setGroup( renderGroup ).setName( 'cameraViewports' );

		cameraViewport = cameraViewports.element( cameraIndex ).toConst( 'cameraViewport' );

	} else {

		// Fallback for single camera
		cameraViewport = vec4( 0, 0, screenSize.x, screenSize.y ).toConst( 'cameraViewport' );

	}

	return cameraViewport;

} ).once() )();
