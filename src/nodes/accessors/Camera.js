import { uniform } from '../core/UniformNode.js';
import { renderGroup, sharedUniformGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { Fn, vec4 } from '../tsl/TSLBase.js';
import { uniformArray } from './UniformArrayNode.js';
import { builtin } from './BuiltinNode.js';
import { screenSize } from '../display/ScreenNode.js';

// Cache single-camera uniforms. Array uniforms belong to each shader builder so
// cameras with different array sizes cannot overwrite each other's buffers.

let _cameraProjectionMatrixBase = null;

let _cameraProjectionMatrixInverseBase = null;

let _cameraViewMatrixBase = null;

let _cameraWorldMatrixBase = null;

let _cameraNormalMatrixBase = null;

let _cameraPositionBase = null;

let _cameraViewportBase = null;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.projectionMatrix );
		const cameraArray = uniformArray( values ).setGroup( renderGroup ).setName( 'cameraProjectionMatrices' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].projectionMatrix;

			}

		} );

		cameraProjectionMatrix = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraProjectionMatrixBase === null ) {

			_cameraProjectionMatrixBase = uniform( camera.projectionMatrix ).setName( 'cameraProjectionMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrix );

		}

		cameraProjectionMatrix = _cameraProjectionMatrixBase;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.projectionMatrixInverse );
		const cameraArray = uniformArray( values ).setGroup( renderGroup ).setName( 'cameraProjectionMatricesInverse' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].projectionMatrixInverse;

			}

		} );

		cameraProjectionMatrixInverse = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraProjectionMatrixInverseBase === null ) {

			_cameraProjectionMatrixInverseBase = uniform( camera.projectionMatrixInverse ).setName( 'cameraProjectionMatrixInverse' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.projectionMatrixInverse );

		}

		cameraProjectionMatrixInverse = _cameraProjectionMatrixInverseBase;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.matrixWorldInverse );
		const cameraArray = uniformArray( values ).setGroup( renderGroup ).setName( 'cameraViewMatrices' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].matrixWorldInverse;

			}

		} );

		cameraViewMatrix = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraViewMatrixBase === null ) {

			_cameraViewMatrixBase = uniform( camera.matrixWorldInverse ).setName( 'cameraViewMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorldInverse );

		}

		cameraViewMatrix = _cameraViewMatrixBase;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.matrixWorld );
		const cameraArray = uniformArray( values ).setGroup( renderGroup ).setName( 'cameraWorldMatrices' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].matrixWorld;

			}

		} );

		cameraWorldMatrix = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraWorldMatrixBase === null ) {

			_cameraWorldMatrixBase = uniform( camera.matrixWorld ).setName( 'cameraWorldMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.matrixWorld );

		}

		cameraWorldMatrix = _cameraWorldMatrixBase;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.normalMatrix );
		const cameraArray = uniformArray( values ).setGroup( renderGroup ).setName( 'cameraNormalMatrices' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].normalMatrix;

			}

		} );

		cameraNormalMatrix = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraNormalMatrixBase === null ) {

			_cameraNormalMatrixBase = uniform( camera.normalMatrix ).setName( 'cameraNormalMatrix' ).setGroup( renderGroup ).onRenderUpdate( ( { camera } ) => camera.normalMatrix );

		}

		cameraNormalMatrix = _cameraNormalMatrixBase;

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

		const cameraArray = uniformArray( positions ).setGroup( renderGroup ).setName( 'cameraPositions' ).onRenderUpdate( ( { camera }, self ) => {

			const subCameras = camera.cameras;
			const array = self.array;

			for ( let i = 0, l = subCameras.length; i < l; i ++ ) {

				array[ i ].setFromMatrixPosition( subCameras[ i ].matrixWorld );

			}

		} );

		cameraPosition = cameraArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex );

	} else {

		if ( _cameraPositionBase === null ) {

			_cameraPositionBase = uniform( new Vector3() ).setName( 'cameraPosition' ).setGroup( renderGroup ).onRenderUpdate( ( { camera }, self ) => self.value.setFromMatrixPosition( camera.matrixWorld ) );

		}

		cameraPosition = _cameraPositionBase;

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

		const values = camera.cameras.map( ( subCamera ) => subCamera.viewport );
		const cameraArray = uniformArray( values, 'vec4' ).setGroup( renderGroup ).setName( 'cameraViewports' ).onRenderUpdate( ( { camera }, self ) => {

			for ( let i = 0; i < camera.cameras.length; i ++ ) {

				self.array[ i ] = camera.cameras[ i ].viewport;

			}

		} );

		cameraViewport = cameraArray.element( cameraIndex );

	} else {

		if ( _cameraViewportBase === null ) {

			// Fallback for single camera
			_cameraViewportBase = vec4( 0, 0, screenSize.x, screenSize.y ).toConst( 'cameraViewport' );

		}

		cameraViewport = _cameraViewportBase;

	}

	return cameraViewport;

} ).once() )();
