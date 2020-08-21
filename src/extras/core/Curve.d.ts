import { Vector } from './../../math/Vector2';

// Extras / Core /////////////////////////////////////////////////////////////////////

/**
 * An extensible curve object which contains methods for interpolation
 * class Curve<T extends Vector>
 */
export class Curve<T extends Vector> {

	/**
	 * @default 'Curve'
	 */
	type: string;

	/**
	 * This value determines the amount of divisions when calculating the cumulative segment lengths of a curve via .getLengths.
	 * To ensure precision when using methods like .getSpacedPoints, it is recommended to increase .arcLengthDivisions if the curve is very large.
	 * @default 200
	 */
	arcLengthDivisions: number;

	/**
	 * Returns a vector for point t of the curve where t is between 0 and 1
	 * getPoint(t: number, optionalTarget?: T): T;
	 */
	getPoint( t: number, optionalTarget?: T ): T;

	/**
	 * Returns a vector for point at relative position in curve according to arc length
	 * getPointAt(u: number, optionalTarget?: T): T;
	 */
	getPointAt( u: number, optionalTarget?: T ): T;

	/**
	 * Get sequence of points using getPoint( t )
	 * getPoints(divisions?: number): T[];
	 */
	getPoints( divisions?: number ): T[];

	/**
	 * Get sequence of equi-spaced points using getPointAt( u )
	 * getSpacedPoints(divisions?: number): T[];
	 */
	getSpacedPoints( divisions?: number ): T[];

	/**
	 * Get total curve arc length
	 */
	getLength(): number;

	/**
	 * Get list of cumulative segment lengths
	 */
	getLengths( divisions?: number ): number[];

	/**
	 * Update the cumlative segment distance cache
	 */
	updateArcLengths(): void;

	/**
	 * Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equi distance
	 */
	getUtoTmapping( u: number, distance: number ): number;

	/**
	 * Returns a unit vector tangent at t. If the subclassed curve do not implement its tangent derivation, 2 points a small delta apart will be used to find its gradient which seems to give a reasonable approximation
	 * getTangent(t: number, optionalTarget?: T): T;
	 */
	getTangent( t: number, optionalTarget?: T ): T;

	/**
	 * Returns tangent at equidistance point u on the curve
	 * getTangentAt(u: number, optionalTarget?: T): T;
	 */
	getTangentAt( u: number, optionalTarget?: T ): T;

	clone(): Curve<T>;
	copy( source: Curve<T> ): this;
	toJSON(): object;
	fromJSON( json: object ): this;

	/**
	 * @deprecated since r84.
	 */
	static create( constructorFunc: Function, getPointFunc: Function ): Function;

}
