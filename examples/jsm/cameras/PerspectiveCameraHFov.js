import { PerspectiveCamera, MathUtils } from "three";

/**
 * convert vFov to hFov
 * @param {number} vFovDeg
 * @param {number} aspect
 * @returns
 */
export function vFov2hFov ( vFovDeg, aspect ) {
	const tanVFovHalf = Math.tan( MathUtils.degToRad( vFovDeg * 0.5 ) ) * aspect;
	return MathUtils.radToDeg( 2 * Math.atan( tanVFovHalf ) );
}

/**
 * convert hFov to vFov
 * @param {number} vFovDeg
 * @param {number} aspect
 * @returns
 */
export function hFov2vFov ( hFovDeg, aspect ) {
	const tanVFovHalf = Math.tan( MathUtils.degToRad( hFovDeg * 0.5 ) ) / aspect;
	return MathUtils.radToDeg( 2 * Math.atan( tanVFovHalf ) );
}

/**
 * PerspectiveCamera with horizontal fov
 */
export class PerspectiveCameraHFov extends PerspectiveCamera {

	updateProjectionMatrix() {
		const hFov = this.fov;
		this.fov = hFov2vFov( this.fov, this.aspect );
		super.updateProjectionMatrix();
		this.fov = hFov;
	}

}
