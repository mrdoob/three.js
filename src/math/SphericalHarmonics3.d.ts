import { Vector3 } from './Vector3';

export class SphericalHarmonics3 {

	constructor();

	coefficients: Vector3[];
	readonly isSphericalHarmonics3: true;

	set ( coefficients: Vector3[] ): SphericalHarmonics3;
	zero(): SphericalHarmonics3;
	add( sh: SphericalHarmonics3 ): SphericalHarmonics3;
	scale( s: number ): SphericalHarmonics3;
	lerp( sh: SphericalHarmonics3, alpha: number ): SphericalHarmonics3;
	equals( sh: SphericalHarmonics3 ): boolean;
	copy( sh: SphericalHarmonics3 ): SphericalHarmonics3;
	clone(): SphericalHarmonics3;

	/**
	 * Sets the values of this spherical harmonics from the provided array.
	 * @param array the source array.
	 * @param offset (optional) offset into the array. Default is 0.
	 */
	fromArray( array: number[], offset?: number ): this;

	/**
	 * Sets the values of this spherical harmonics from the provided array-like.
	 * @param array the source array-like.
	 * @param offset (optional) offset into the array-like. Default is 0.
	 */
	fromArray( array: ArrayLike<number>, offset?: number ): this;

	/**
	 * Returns an array with the values of this spherical harmonics, or copies them into the provided array.
	 * @param array (optional) array to store the spherical harmonics to. If this is not provided, a new array will be created.
	 * @param offset (optional) optional offset into the array.
	 * @return The created or provided array.
	 */
	toArray( array?: number[], offset?: number ): number[];

	/**
	 * Returns an array with the values of this spherical harmonics, or copies them into the provided array-like.
	 * @param array array-like to store the spherical harmonics to.
	 * @param offset (optional) optional offset into the array-like.
	 * @return The provided array-like.
	 */
	toArray( array: ArrayLike<number>, offset?: number ): ArrayLike<number>;

	getAt( normal: Vector3, target: Vector3 ) : Vector3;
	getIrradianceAt( normal: Vector3, target: Vector3 ) : Vector3;

	static getBasisAt( normal: Vector3, shBasis: number[] ): void;

}
