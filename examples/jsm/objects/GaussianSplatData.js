import {
	Box3,
	Sphere,
	Vector3
} from 'three';

const _center = /*@__PURE__*/ new Vector3();

/**
 * Renderer-agnostic container for 3D Gaussian splat data.
 *
 * ```js
 * const data = new GaussianSplatData( { centers, covariances, colors } );
 * ```
 *
 * @three_import import { GaussianSplatData } from 'three/addons/objects/GaussianSplatData.js';
 */
class GaussianSplatData {

	/**
	 * Constructs a new Gaussian splat data container.
	 *
	 * @param {Object} parameters - The splat data.
	 * @param {Float32Array} parameters.centers - Splat centers, three values per splat.
	 * @param {Float32Array} parameters.covariances - Symmetric 3D covariance, six values per splat: xx, xy, xz, yy, yz, zz.
	 * @param {Uint8Array} parameters.colors - Splat colors, four normalized byte values per splat: red, green, blue, opacity.
	 * @param {number} [parameters.count] - The number of splats. If omitted, it is inferred from `centers`.
	 */
	constructor( { centers, covariances, colors, count = centers ? centers.length / 3 : 0 } = {} ) {

		if ( centers === undefined || covariances === undefined || colors === undefined ) {

			throw new Error( 'THREE.GaussianSplatData: centers, covariances and colors are required.' );

		}

		if ( centers.length !== count * 3 ) {

			throw new Error( 'THREE.GaussianSplatData: Invalid centers length.' );

		}

		if ( covariances.length !== count * 6 ) {

			throw new Error( 'THREE.GaussianSplatData: Invalid covariances length.' );

		}

		if ( colors.length !== count * 4 ) {

			throw new Error( 'THREE.GaussianSplatData: Invalid colors length.' );

		}

		/**
		 * The number of splats.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Splat centers, three values per splat.
		 *
		 * @type {Float32Array}
		 */
		this.centers = centers;

		/**
		 * Symmetric 3D covariance, six values per splat: xx, xy, xz, yy, yz, zz.
		 *
		 * @type {Float32Array}
		 */
		this.covariances = covariances;

		/**
		 * Splat colors, four normalized byte values per splat: red, green, blue, opacity.
		 *
		 * @type {Uint8Array}
		 */
		this.colors = colors;

		/**
		 * Bounding box of all splat centers.
		 *
		 * @type {Box3}
		 */
		this.boundingBox = new Box3();

		/**
		 * Bounding sphere of all splat centers.
		 *
		 * @type {Sphere}
		 */
		this.boundingSphere = new Sphere();

		this.computeBounds();

	}

	/**
	 * Recomputes `boundingBox` and `boundingSphere` from the splat centers.
	 *
	 * @return {GaussianSplatData} A reference to this object.
	 */
	computeBounds() {

		const { centers, count } = this;
		const box = this.boundingBox;

		box.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			_center.set( centers[ i3 ], centers[ i3 + 1 ], centers[ i3 + 2 ] );
			box.expandByPoint( _center );

		}

		box.getBoundingSphere( this.boundingSphere );

		return this;

	}

}

export { GaussianSplatData };
