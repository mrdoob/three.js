import { uniform } from '../core/UniformNode.js';
import { renderGroup, sharedUniformGroup } from '../core/UniformGroupNode.js';
import { Vector3 } from '../../math/Vector3.js';
import { Fn, vec4 } from '../tsl/TSLBase.js';
import { uniformArray } from './UniformArrayNode.js';
import { builtin } from './BuiltinNode.js';
import { screenSize } from '../display/ScreenNode.js';

// Cache node uniforms

let _cameraProjectionMatrixBase = null;
let _cameraProjectionMatrixArray = null;

let _cameraProjectionMatrixInverseBase = null;
let _cameraProjectionMatrixInverseArray = null;

let _cameraViewMatrixBase = null;
let _cameraViewMatrixArray = null;

let _cameraWorldMatrixBase = null;
let _cameraWorldMatrixArray = null;

let _cameraNormalMatrixBase = null;
let _cameraNormalMatrixArray = null;

let _cameraPositionBase = null;
let _cameraPositionArray = null;

let _cameraViewportBase = null;
let _cameraViewportArray = null;

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

		if ( _cameraProjectionMatrixArray === null ) {

			_cameraProjectionMatrixArray = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraProjectionMatrices' );

		} else {

			_cameraProjectionMatrixArray.array = matrices;

		}

		cameraProjectionMatrix = _cameraProjectionMatrixArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraProjectionMatrix' );

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

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.projectionMatrixInverse );

		}

		if ( _cameraProjectionMatrixInverseArray === null ) {

			_cameraProjectionMatrixInverseArray = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraProjectionMatricesInverse' );

		} else {

			_cameraProjectionMatrixInverseArray.array = matrices;

		}

		cameraProjectionMatrixInverse = _cameraProjectionMatrixInverseArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraProjectionMatrixInverse' );

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

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.matrixWorldInverse );

		}

		if ( _cameraViewMatrixArray === null ) {

			_cameraViewMatrixArray = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraViewMatrices' );

		} else {

			_cameraViewMatrixArray.array = matrices;

		}

		cameraViewMatrix = _cameraViewMatrixArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraViewMatrix' );

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

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.matrixWorld );

		}

		if ( _cameraWorldMatrixArray === null ) {

			_cameraWorldMatrixArray = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraWorldMatrices' );

		} else {

			_cameraWorldMatrixArray.array = matrices;

		}

		cameraWorldMatrix = _cameraWorldMatrixArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraWorldMatrix' );

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

		const matrices = [];

		for ( const subCamera of camera.cameras ) {

			matrices.push( subCamera.normalMatrix );

		}

		if ( _cameraNormalMatrixArray === null ) {

			_cameraNormalMatrixArray = uniformArray( matrices ).setGroup( renderGroup ).setName( 'cameraNormalMatrices' );

		} else {

			_cameraNormalMatrixArray.array = matrices;

		}

		cameraNormalMatrix = _cameraNormalMatrixArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraNormalMatrix' );

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

		if ( _cameraPositionArray === null ) {

			_cameraPositionArray = uniformArray( positions ).setGroup( renderGroup ).setName( 'cameraPositions' ).onRenderUpdate( ( { camera }, self ) => {

				const subCameras = camera.cameras;
				const array = self.array;

				for ( let i = 0, l = subCameras.length; i < l; i ++ ) {

					array[ i ].setFromMatrixPosition( subCameras[ i ].matrixWorld );

				}

			} );

		} else {

			_cameraPositionArray.array = positions;

		}

		cameraPosition = _cameraPositionArray.element( camera.isMultiViewCamera ? builtin( 'gl_ViewID_OVR' ) : cameraIndex ).toConst( 'cameraPosition' );

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

		const viewports = [];

		for ( const subCamera of camera.cameras ) {

			viewports.push( subCamera.viewport );

		}

		if ( _cameraViewportArray === null ) {

			_cameraViewportArray = uniformArray( viewports, 'vec4' ).setGroup( renderGroup ).setName( 'cameraViewports' );

		} else {

			_cameraViewportArray.array = viewports;

		}

		cameraViewport = _cameraViewportArray.element( cameraIndex ).toConst( 'cameraViewport' );

	} else {

		if ( _cameraViewportBase === null ) {

			// Fallback for single camera
			_cameraViewportBase = vec4( 0, 0, screenSize.x, screenSize.y ).toConst( 'cameraViewport' );

		}

		cameraViewport = _cameraViewportBase;

	}

	return cameraViewport;

} ).once() )();
