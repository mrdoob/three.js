import { Earcut } from './Earcut.js';
import cdt2d from './cdt2d/cdt2d.js';

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
	 * Triangulates the given shape definition using Constrained Delaunay Triangulation.
	 *
	 * @param {Array<Vector2>} contour - An array of 2D points defining the contour.
	 * @param {Array<Array<Vector2>>} holes - An array that holds arrays of 2D points defining the holes.
	 * @returns {Array<Array<int>>} An array of int[] where each element defines a triangle with [ v0, v1, v2 ]. Vertex indices refer to all vertices passed into the function, in order (contour first, then each hole).
	 */
	static triangulateShapeConstrainedDelaunay( contour, holes ) {

		//cleanUpPoints(contour);
		//holes.forEach(cleanUpPoints);

		const allPoints = []; //Array of int[]s, where each element defines a vert of the form [x,y]
		const allEdges = []; //Array of int[]s, where each element defines an edge of the form [prevVert, nextVert]. Edges do not have to be a continuous strip.
		let totalPoints = 0;
		for ( let i = 0, il = contour.length; i < il; i ++ ) {

			const point = contour[ i ];
			allPoints.push( [ point.x, point.y ] );
			const nextIndex = ( i + 1 ) % il;
			allEdges.push( [ i, nextIndex ] );

		}

		totalPoints += contour.length;

		holes.forEach( hole => {

			const holeEdges = [];
			for ( let i = 0, il = hole.length; i < il; i ++ ) {

				const point = hole[ i ];
				allPoints.push( [ point.x, point.y ] );

				//Reversed
				const currentIndex_thisHole = i;
				const nextIndex_thisHole = ( i + 1 ) % il;
				holeEdges.push( [ totalPoints + currentIndex_thisHole, totalPoints + nextIndex_thisHole ] );
				//holeEdges.unshift([totalPoints + nextIndex_thisHole, totalPoints + currentIndex_thisHole])

			}

			Array.prototype.push.apply( allEdges, holeEdges ); //Efficient in-place concat
			totalPoints += hole.length;

		} );

		const res = cdt2d( allPoints, allEdges, { exterior: false, interior: true } ); //Returns an array of int[]s, where each element is of the form [v0, v1, v2], defining a triangle with indices from the points array.
		return res;

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
