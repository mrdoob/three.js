import { Earcut } from './Earcut.js';

const ShapeUtils = {

	// calculate area of the contour polygon

	area: function ( contour ) {

		const n = contour.length;
		let a = 0.0;

		for ( let p = n - 1, q = 0; q < n; p = q ++ ) {

			a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

		}

		return a * 0.5;

	},

	isClockWise: function ( pts ) {

		return ShapeUtils.area( pts ) < 0;

	},

	triangulateShape: function ( contour, holes ) {

		const vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices = []; // array of hole indices
		const faces = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]

		removeDupEndPts( contour );
		addContour( vertices, contour );

		//

		let holeIndex = contour.length;

		holes.forEach( removeDupEndPts );

		for ( let i = 0; i < holes.length; i ++ ) {

			holeIndices.push( holeIndex );
			holeIndex += holes[ i ].length;
			addContour( vertices, holes[ i ] );

		}

		//

		const triangles = Earcut.triangulate( vertices, holeIndices );

		//

		for ( let i = 0; i < triangles.length; i += 3 ) {

			faces.push( triangles.slice( i, i + 3 ) );

		}

		return faces;

	}

};

function removeDupEndPts( points ) {

	const l = points.length;

	if ( l > 2 && points[ l - 1 ].equals( points[ 0 ] ) ) {

		points.pop();

	}

}

function addContour( vertices, contour ) {

	for ( let i = 0; i < contour.length; i ++ ) {

		vertices.push( contour[ i ].x );
		vertices.push( contour[ i ].y );

	}

}

export { ShapeUtils };
