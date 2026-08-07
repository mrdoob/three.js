import {
	MathUtils,
	mat4Invert,
	mat4Set,
	quatCreate,
	quatMultiply,
	quatSetFromUnitVectors,
	vec3ApplyQuaternion,
	vec3Create,
	vec3CrossVectors,
	vec3Dot,
	vec3Length,
	vec3Normalize,
	vec3Set,
	vec3SubVectors
} from 'three';

/**
 * @module CameraUtils
 * @three_import import * as CameraUtils from 'three/addons/utils/CameraUtils.js';
 */

const _va = /*@__PURE__*/ vec3Create(), // from pe to pa
	_vb = /*@__PURE__*/ vec3Create(), // from pe to pb
	_vc = /*@__PURE__*/ vec3Create(), // from pe to pc
	_vr = /*@__PURE__*/ vec3Create(), // right axis of screen
	_vu = /*@__PURE__*/ vec3Create(), // up axis of screen
	_vn = /*@__PURE__*/ vec3Create(), // normal vector of screen
	_vec = /*@__PURE__*/ vec3Create(), // temporary vector
	_quat = /*@__PURE__*/ quatCreate(); // temporary quaternion


/**
 * Set projection matrix and the orientation of a perspective camera
 * to exactly frame the corners of an arbitrary rectangle.
 * NOTE: This function ignores the standard parameters;
 * do not call `updateProjectionMatrix()` after this.
 *
 * @param {PerspectiveCamera} camera - The camera.
 * @param {Vector3} bottomLeftCorner - The bottom-left corner point.
 * @param {Vector3} bottomRightCorner - The bottom-right corner point.
 * @param {Vector3} topLeftCorner - The top-left corner point.
 * @param {boolean} [estimateViewFrustum=false] - If set to `true`, the function tries to estimate the camera's FOV.
 */
function frameCorners( camera, bottomLeftCorner, bottomRightCorner, topLeftCorner, estimateViewFrustum = false ) {

	const pa = bottomLeftCorner, pb = bottomRightCorner, pc = topLeftCorner;
	const pe = camera.position; // eye position
	const n = camera.near; // distance of near clipping plane
	const f = camera.far; //distance of far clipping plane

	vec3Normalize( vec3SubVectors( pb, pa, _vr ), _vr );
	vec3Normalize( vec3SubVectors( pc, pa, _vu ), _vu );
	vec3Normalize( vec3CrossVectors( _vr, _vu, _vn ), _vn );

	vec3SubVectors( pa, pe, _va ); // from pe to pa
	vec3SubVectors( pb, pe, _vb ); // from pe to pb
	vec3SubVectors( pc, pe, _vc ); // from pe to pc

	const d = - vec3Dot( _va, _vn );	// distance from eye to screen
	const l = vec3Dot( _vr, _va ) * n / d; // distance to left screen edge
	const r = vec3Dot( _vr, _vb ) * n / d; // distance to right screen edge
	const b = vec3Dot( _vu, _va ) * n / d; // distance to bottom screen edge
	const t = vec3Dot( _vu, _vc ) * n / d; // distance to top screen edge

	// Set the camera rotation to match the focal plane to the corners' plane
	quatSetFromUnitVectors( vec3Set( _vec, 0, 1, 0 ), _vu, _quat );
	quatSetFromUnitVectors( vec3ApplyQuaternion( vec3Set( _vec, 0, 0, 1 ), _quat, _vec ), _vn, camera.quaternion );
	quatMultiply( camera.quaternion, _quat, camera.quaternion );

	// Set the off-axis projection matrix to match the corners
	mat4Set( camera.projectionMatrix, 2.0 * n / ( r - l ), 0.0,
		( r + l ) / ( r - l ), 0.0, 0.0,
		2.0 * n / ( t - b ),
		( t + b ) / ( t - b ), 0.0, 0.0, 0.0,
		( f + n ) / ( n - f ),
		2.0 * f * n / ( n - f ), 0.0, 0.0, - 1.0, 0.0 );
	mat4Invert( camera.projectionMatrix, camera.projectionMatrixInverse );

	// FoV estimation to fix frustum culling
	if ( estimateViewFrustum ) {

		// Set fieldOfView to a conservative estimate
		// to make frustum tall/wide enough to encompass it
		camera.fov =
			MathUtils.RAD2DEG / Math.min( 1.0, camera.aspect ) *
			Math.atan( ( vec3Length( vec3SubVectors( pb, pa, _vec ) ) +
							( vec3Length( vec3SubVectors( pc, pa, _vec ) ) ) ) / vec3Length( _va ) );

	}

}

export { frameCorners };
