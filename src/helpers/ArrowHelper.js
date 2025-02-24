import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Object3D } from '../core/Object3D.js';
import { CylinderGeometry } from '../geometries/CylinderGeometry.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Mesh } from '../objects/Mesh.js';
import { Line } from '../objects/Line.js';
import { Vector3 } from '../math/Vector3.js';

const _axis = /*@__PURE__*/ new Vector3();
let _lineGeometry, _coneGeometry;

/**
 * An 3D arrow object for visualizing directions.
 *
 * ```js
 * const dir = new THREE.Vector3( 1, 2, 0 );
 *
 * //normalize the direction vector (convert to vector of length 1)
 * dir.normalize();
 *
 * const origin = new THREE.Vector3( 0, 0, 0 );
 * const length = 1;
 * const hex = 0xffff00;
 *
 * const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
 * scene.add( arrowHelper );
 * ```
 *
 * @augments Object3D
 */
class ArrowHelper extends Object3D {

	/**
	 * Constructs a new arrow helper.
	 *
	 * @param {Vector3} [dir=(0, 0, 1)] - The (normalized) direction vector.
	 * @param {Vector3} [origin=(0, 0, 0)] - Point at which the arrow starts.
	 * @param {number} [length=1] - Length of the arrow in world units.
	 * @param {(number|Color|string)} [color=0xffff00] - Color of the arrow.
	 * @param {number} [headLength=length*0.2] - The length of the head of the arrow.
	 * @param {number} [headWidth=headLength*0.2] - The width of the head of the arrow.
	 */
	constructor( dir = new Vector3( 0, 0, 1 ), origin = new Vector3( 0, 0, 0 ), length = 1, color = 0xffff00, headLength = length * 0.2, headWidth = headLength * 0.2 ) {

		super();

		this.type = 'ArrowHelper';

		if ( _lineGeometry === undefined ) {

			_lineGeometry = new BufferGeometry();
			_lineGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 1, 0 ], 3 ) );

			_coneGeometry = new CylinderGeometry( 0, 0.5, 1, 5, 1 );
			_coneGeometry.translate( 0, - 0.5, 0 );

		}

		this.position.copy( origin );

		/**
		 * The line part of the arrow helper.
		 *
		 * @type {Line}
		 */
		this.line = new Line( _lineGeometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );
		this.line.matrixAutoUpdate = false;
		this.add( this.line );

		/**
		 * The cone part of the arrow helper.
		 *
		 * @type {Mesh}
		 */
		this.cone = new Mesh( _coneGeometry, new MeshBasicMaterial( { color: color, toneMapped: false } ) );
		this.cone.matrixAutoUpdate = false;
		this.add( this.cone );

		this.setDirection( dir );
		this.setLength( length, headLength, headWidth );

	}

	/**
	 * Sets the direction of the helper.
	 *
	 * @param {Vector3} dir - The normalized direction vector.
	 */
	setDirection( dir ) {

		// dir is assumed to be normalized

		if ( dir.y > 0.99999 ) {

			this.quaternion.set( 0, 0, 0, 1 );

		} else if ( dir.y < - 0.99999 ) {

			this.quaternion.set( 1, 0, 0, 0 );

		} else {

			_axis.set( dir.z, 0, - dir.x ).normalize();

			const radians = Math.acos( dir.y );

			this.quaternion.setFromAxisAngle( _axis, radians );

		}

	}

	/**
	 * Sets the length of the helper.
	 *
	 * @param {number} length - Length of the arrow in world units.
	 * @param {number} [headLength=length*0.2] - The length of the head of the arrow.
	 * @param {number} [headWidth=headLength*0.2] - The width of the head of the arrow.
	 */
	setLength( length, headLength = length * 0.2, headWidth = headLength * 0.2 ) {

		this.line.scale.set( 1, Math.max( 0.0001, length - headLength ), 1 ); // see #17458
		this.line.updateMatrix();

		this.cone.scale.set( headWidth, headLength, headWidth );
		this.cone.position.y = length;
		this.cone.updateMatrix();

	}

	/**
	 * Sets the color of the helper.
	 *
	 * @param {number|Color|string} color - The color to set.
	 */
	setColor( color ) {

		this.line.material.color.set( color );
		this.cone.material.color.set( color );

	}

	copy( source ) {

		super.copy( source, false );

		this.line.copy( source.line );
		this.cone.copy( source.cone );

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.line.geometry.dispose();
		this.line.material.dispose();
		this.cone.geometry.dispose();
		this.cone.material.dispose();

	}

}

export { ArrowHelper };
