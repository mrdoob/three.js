import { Line, BufferGeometry, LineBasicMaterial, Vector3 } from 'three';

/**
 * Visualizes a curve path by rendering it as a line in 3D space.
 * Useful for debugging and visualizing camera paths or other spline-based movements.
 *
 * ```js
 * const curve = new THREE.CatmullRomCurve3( points );
 * const helper = new SplineHelper( curve, 100, 0xff0000 );
 * scene.add( helper );
 * ```
 *
 * @three_import import { SplineHelper } from 'three/addons/helpers/SplineHelper.js';
 */
class SplineHelper extends Line {

	/**
	 * Constructs a new spline helper.
	 *
	 * @param {Curve} curve - The curve to visualize.
	 * @param {number} pointsCount - Number of points to sample along the curve (default: 100).
	 * @param {number|string} color - Color of the line (default: 0xffffff).
	 */
	constructor( curve, pointsCount = 100, color = 0xffffff ) {

		const geometry = new BufferGeometry();
		const material = new LineBasicMaterial( { color: color, toneMapped: false } );

		super( geometry, material );

		this.curve = curve;
		this.pointsCount = pointsCount;
		this.type = 'SplineHelper';

		this.update();

	}

	/**
	 * Update the helper geometry to reflect changes in the curve.
	 * Call this after modifying the curve's control points.
	 *
	 * @return {SplineHelper}
	 */
	update() {

		const points = this.curve.getPoints( this.pointsCount );
		this.geometry.setFromPoints( points );
		this.geometry.computeBoundingSphere();

		return this;

	}

	/**
	 * Clean up resources.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { SplineHelper };
