import { Earcut } from './Earcut.js';

/**
 * A class containing utility functions for shapes.
 *
 * @hideconstructor
 */
class ShapeUtils {

	/**
	 * Calculate area of a ( 2D ) contour polygon.
	 *
	 * @param {Array<Vector2>} contour - An array of 2D points.
	 * @return {number} The area.
	 */
	static area( contour ) {

		const n = contour.length;
		let a = 0.0;

		for ( let p = n - 1, q = 0; q < n; p = q ++ ) {

			a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

		}

		return a * 0.5;

	}

	/**
	 * Returns `true` if the given contour uses a clockwise winding order.
	 *
	 * @param {Array<Vector2>} pts - An array of 2D points defining a polygon.
	 * @return {boolean} Whether the given contour uses a clockwise winding order or not.
	 */
	static isClockWise( pts ) {

		return ShapeUtils.area( pts ) < 0;

	}

	/**
	 * Triangulates the given shape definition using Earcut.
	 *
	 * @param {Array<Vector2>} contour - An array of 2D points defining the contour.
	 * @param {Array<Array<Vector2>>} holes - An array that holds arrays of 2D points defining the holes.
	 * @return {Array<Array<number>>} An array that holds for each face definition an array with three indices.
	 */
	static triangulateShape( contour, holes ) {

		const vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices = []; // array of hole indices
		const faces = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]

		removeDupEndPts( contour );
		addContour( vertices, contour );

		//

		let holeFirstVertIndex = contour.length;

		holes.forEach( removeDupEndPts );

		for ( let i = 0; i < holes.length; i ++ ) {

			holeIndices.push( holeFirstVertIndex );
			holeFirstVertIndex += holes[ i ].length;
			addContour( vertices, holes[ i ] );

		}

		//

		//At this point we have a flat number array of X,Y values, and a list of indices in that list which correspond to the start of holes.
		//So eg. <contour points>,<hole 1 points>,<hole 2 points>...
		const triangles = Earcut.triangulate( vertices, holeIndices );

		//

		for ( let i = 0; i < triangles.length; i += 3 ) {

			faces.push( triangles.slice( i, i + 3 ) );

		}

		return faces;

	}

}

function removeDupEndPts( points ) {

	const l = points.length;

	if ( l > 2 && points[ l - 1 ].equals( points[ 0 ] ) ) {

		points.pop();

	}

}

/**Pushes each X,Y pair of the contour onto the vertices array.
 * @param {number[]} vertices Flat array of X,Y pairs to append to.
 * @param {Vector2[]} contour
*/
function addContour( vertices, contour ) {

	for ( let i = 0; i < contour.length; i ++ ) {

		vertices.push( contour[ i ].x );
		vertices.push( contour[ i ].y );

	}

}

export { ShapeUtils };
