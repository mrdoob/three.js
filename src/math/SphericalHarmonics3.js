import { Vector3 } from './Vector3.js';
import {
	sh3Add,
	sh3AddScaledSH,
	sh3Copy,
	sh3Equals,
	sh3FromArray,
	sh3GetAt,
	sh3GetBasisAt,
	sh3GetIrradianceAt,
	sh3Lerp,
	sh3Scale,
	sh3Set,
	sh3ToArray,
	sh3Zero
} from './SphericalHarmonics3Functions.js';

/**
 * Represents a third-order spherical harmonics (SH). Light probes use this class
 * to encode lighting information.
 *
 * - Primary reference: {@link https://graphics.stanford.edu/papers/envmap/envmap.pdf}
 * - Secondary reference: {@link https://www.ppsloan.org/publications/StupidSH36.pdf}
 *
 * `SphericalHarmonics3` is a thin, backwards-compatible wrapper around the
 * standalone, tree-shakeable `sh3*` functions in {@link SphericalHarmonics3Functions},
 * which operate on any {@link SphericalHarmonics3Like} object. Prefer importing
 * those functions directly if you only need a handful of operations and want
 * unused ones eliminated from your bundle.
 */
class SphericalHarmonics3 {

	/**
	 * Constructs a new spherical harmonics.
	 */
	constructor() {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		Object.defineProperty( this, 'isSphericalHarmonics3', { value: true } );

		/**
		 * An array holding the (9) SH coefficients.
		 *
		 * @type {Array<Vector3>}
		 */
		this.coefficients = [];

		for ( let i = 0; i < 9; i ++ ) {

			this.coefficients.push( new Vector3() );

		}

	}

	/**
	 * Sets the given SH coefficients to this instance by copying
	 * the values.
	 *
	 * @param {Array<Vector3>} coefficients - The SH coefficients.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	set( coefficients ) {

		return sh3Set( coefficients, this );

	}

	/**
	 * Sets all SH coefficients to `0`.
	 *
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	zero() {

		return sh3Zero( this );

	}

	/**
	 * Returns the radiance in the direction of the given normal.
	 *
	 * @param {Vector3} normal - The normal vector (assumed to be unit length)
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The radiance.
	 */
	getAt( normal, target ) {

		return sh3GetAt( this, normal, target );

	}

	/**
	 * Returns the irradiance (radiance convolved with cosine lobe) in the
	 * direction of the given normal.
	 *
	 * @param {Vector3} normal - The normal vector (assumed to be unit length)
	 * @param {Vector3} target - The target vector that is used to store the method's result.
	 * @return {Vector3} The irradiance.
	 */
	getIrradianceAt( normal, target ) {

		return sh3GetIrradianceAt( this, normal, target );

	}

	/**
	 * Adds the given SH to this instance.
	 *
	 * @param {SphericalHarmonics3} sh - The SH to add.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	add( sh ) {

		return sh3Add( this, sh, this );

	}

	/**
	 * A convenience method for performing {@link SphericalHarmonics3#add} and
	 * {@link SphericalHarmonics3#scale} at once.
	 *
	 * @param {SphericalHarmonics3} sh - The SH to add.
	 * @param {number} s - The scale factor.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	addScaledSH( sh, s ) {

		return sh3AddScaledSH( this, sh, s, this );

	}

	/**
	 * Scales this SH by the given scale factor.
	 *
	 * @param {number} s - The scale factor.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	scale( s ) {

		return sh3Scale( this, s, this );

	}

	/**
	 * Linear interpolates between the given SH and this instance by the given
	 * alpha factor.
	 *
	 * @param {SphericalHarmonics3} sh - The SH to interpolate with.
	 * @param {number} alpha - The alpha factor.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	lerp( sh, alpha ) {

		return sh3Lerp( this, sh, alpha, this );

	}

	/**
	 * Returns `true` if this spherical harmonics is equal with the given one.
	 *
	 * @param {SphericalHarmonics3} sh - The spherical harmonics to test for equality.
	 * @return {boolean} Whether this spherical harmonics is equal with the given one.
	 */
	equals( sh ) {

		return sh3Equals( this, sh );

	}

	/**
	 * Copies the values of the given spherical harmonics to this instance.
	 *
	 * @param {SphericalHarmonics3} sh - The spherical harmonics to copy.
	 * @return {SphericalHarmonics3} A reference to this spherical harmonics.
	 */
	copy( sh ) {

		return sh3Copy( sh, this );

	}

	/**
	 * Returns a new spherical harmonics with copied values from this instance.
	 *
	 * @return {SphericalHarmonics3} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

	/**
	 * Sets the SH coefficients of this instance from the given array.
	 *
	 * @param {Array<number>} array - An array holding the SH coefficients.
	 * @param {number} [offset=0] - The array offset where to start copying.
	 * @return {SphericalHarmonics3} A clone of this instance.
	 */
	fromArray( array, offset = 0 ) {

		return sh3FromArray( array, offset, this );

	}

	/**
	 * Returns an array with the SH coefficients, or copies them into the provided
	 * array. The coefficients are represented as numbers.
	 *
	 * @param {Array<number>} [array=[]] - The target array.
	 * @param {number} [offset=0] - The array offset where to start copying.
	 * @return {Array<number>} An array with flat SH coefficients.
	 */
	toArray( array = [], offset = 0 ) {

		return sh3ToArray( this, array, offset );

	}

	/**
	 * Computes the SH basis for the given normal vector.
	 *
	 * @param {Vector3} normal - The normal.
	 * @param {Array<number>} shBasis - The target array holding the SH basis.
	 */
	static getBasisAt( normal, shBasis ) {

		sh3GetBasisAt( normal, shBasis );

	}

}

export { SphericalHarmonics3 };
