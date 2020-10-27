import { Vector2 } from './../../math/Vector2';
import { Path } from './Path';
import { ExtrudeGeometry } from './../../geometries/ExtrudeGeometry';
import { ShapeGeometry } from './../../geometries/ShapeGeometry';

/**
 * Defines a 2d shape plane using paths.
 */
export class Shape extends Path {

	constructor( points?: Vector2[] );

	/**
	 * @default 'Shape'
	 */
	type: string;

	/**
	 * @default []
	 */
	holes: Path[];

	/**
	 * @deprecated Use {@link ExtrudeGeometry ExtrudeGeometry()} instead.
	 */
	extrude( options?: any ): ExtrudeGeometry;

	/**
	 * @deprecated Use {@link ShapeGeometry ShapeGeometry()} instead.
	 */
	makeGeometry( options?: any ): ShapeGeometry;
	getPointsHoles( divisions: number ): Vector2[][];

	/**
	 * @deprecated Use {@link Shape#extractPoints .extractPoints()} instead.
	 */
	extractAllPoints(
		divisions: number
	): {
		shape: Vector2[];
		holes: Vector2[][];
	};
	extractPoints( divisions: number ): {
		shape: Vector2[];
		holes: Vector2[][];
	};

}
