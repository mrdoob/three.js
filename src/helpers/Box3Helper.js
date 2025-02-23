import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferAttribute, Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

/**
 * A helper object to visualize an instance of {@link Box3}.
 *
 * ```js
 * const box = new THREE.Box3();
 * box.setFromCenterAndSize( new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 2, 1, 3 ) );
 *
 * const helper = new THREE.Box3Helper( box, 0xffff00 );
 * scene.add( helper )
 * ```
 *
 * @augments LineSegments
 */
class Box3Helper extends LineSegments {

	/**
	 * Constructs a new box3 helper.
	 *
	 * @param {Box3} box - The box to visualize.
	 * @param {number|Color|string} [color=0xffff00] - The box's color.
	 */
	constructor( box, color = 0xffff00 ) {

		const indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );

		const positions = [ 1, 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 1, - 1, 1, - 1, - 1 ];

		const geometry = new BufferGeometry();

		geometry.setIndex( new BufferAttribute( indices, 1 ) );

		geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

		super( geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

		/**
		 * The box being visualized.
		 *
		 * @type {Box3}
		 */
		this.box = box;

		this.type = 'Box3Helper';

		this.geometry.computeBoundingSphere();

	}

	updateMatrixWorld( force ) {

		const box = this.box;

		if ( box.isEmpty() ) return;

		box.getCenter( this.position );

		box.getSize( this.scale );

		this.scale.multiplyScalar( 0.5 );

		super.updateMatrixWorld( force );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.geometry.dispose();
		this.material.dispose();

	}

}

export { Box3Helper };
