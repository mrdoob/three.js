import {
	MathUtils,
	Quaternion,
	Vector3
} from '../../../build/three.module.js';

const _va = /*@__PURE__*/ new Vector3(), // from pe to pa
	_vb = /*@__PURE__*/ new Vector3(), // from pe to pb
	_vc = /*@__PURE__*/ new Vector3(), // from pe to pc
	_vr = /*@__PURE__*/ new Vector3(), // right axis of screen
	_vu = /*@__PURE__*/ new Vector3(), // up axis of screen
	_vn = /*@__PURE__*/ new Vector3(), // normal vector of screen
	_vec = /*@__PURE__*/ new Vector3(), // temporary vector
	_quat = /*@__PURE__*/ new Quaternion(); // temporary quaternion


/** Set a PerspectiveCamera's projectionMatrix and quaternion
 * to exactly frame the corners of an arbitrary rectangle.
 * NOTE: This function ignores the standard parameters;
 * do not call updateProjectionMatrix() after this!
 * @param {Vector3} bottomLeftCorner
 * @param {Vector3} bottomRightCorner
 * @param {Vector3} topLeftCorner
 * @param {boolean} estimateViewFrustum */
function frameCorners( camera, bottomLeftCorner, bottomRightCorner, topLeftCorner, estimateViewFrustum = false ) {

	const pa = bottomLeftCorner, pb = bottomRightCorner, pc = topLeftCorner;
	const pe = camera.position; // eye position
	const n = camera.near; // distance of near clipping plane
	const f = camera.far; //distance of far clipping plane

	_vr.copy( pb ).sub( pa ).normalize();
	_vu.copy( pc ).sub( pa ).normalize();
	_vn.crossVectors( _vr, _vu ).normalize();

	_va.copy( pa ).sub( pe ); // from pe to pa
	_vb.copy( pb ).sub( pe ); // from pe to pb
	_vc.copy( pc ).sub( pe ); // from pe to pc

	const d = - _va.dot( _vn );	// distance from eye to screen
	const l = _vr.dot( _va ) * n / d; // distance to left screen edge
	const r = _vr.dot( _vb ) * n / d; // distance to right screen edge
	const b = _vu.dot( _va ) * n / d; // distance to bottom screen edge
	const t = _vu.dot( _vc ) * n / d; // distance to top screen edge

	// Set the camera rotation to match the focal plane to the corners' plane
	_quat.setFromUnitVectors( _vec.set( 0, 1, 0 ), _vu );
	camera.quaternion.setFromUnitVectors( _vec.set( 0, 0, 1 ).applyQuaternion( _quat ), _vn ).multiply( _quat );

	// Set the off-axis projection matrix to match the corners
	camera.projectionMatrix.set( 2.0 * n / ( r - l ), 0.0,
		( r + l ) / ( r - l ), 0.0, 0.0,
		2.0 * n / ( t - b ),
		( t + b ) / ( t - b ), 0.0, 0.0, 0.0,
		( f + n ) / ( n - f ),
		2.0 * f * n / ( n - f ), 0.0, 0.0, - 1.0, 0.0 );
	camera.projectionMatrixInverse.copy( camera.projectionMatrix ).invert();

	// FoV estimation to fix frustum culling
	if ( estimateViewFrustum ) {

		// Set fieldOfView to a conservative estimate
		// to make frustum tall/wide enough to encompass it
		camera.fov =
			MathUtils.RAD2DEG / Math.min( 1.0, camera.aspect ) *
			Math.atan( ( _vec.copy( pb ).sub( pa ).length() +
							( _vec.copy( pc ).sub( pa ).length() ) ) / _va.length() );

	}

}

export { frameCorners };
