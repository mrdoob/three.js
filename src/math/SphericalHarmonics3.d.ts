import { Vector3 } from './Vector3.js';

export class SphericalHarmonics3 {
	constructor();

	coefficients: Vector3[];
	isSphericalHarmonics3: boolean;

	set (coefficients: Vector3[]): SphericalHarmonics3;
	zero(): SphericalHarmonics3;
	add(sh: SphericalHarmonics3): SphericalHarmonics3;
	scale(s: number): SphericalHarmonics3;
	lerp(sh: SphericalHarmonics3, alpha: number): SphericalHarmonics3;
	equals(sh: SphericalHarmonics3): boolean;
	copy(sh: SphericalHarmonics3): SphericalHarmonics3;
	clone(): SphericalHarmonics3;
	fromArray(array: number[]): SphericalHarmonics3;
	toArray(): number[];

	static getBasisAt(normal: Vector3, shBasis: number[]): void;
};
