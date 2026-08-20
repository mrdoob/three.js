import { Color } from '../../math/Color.js';
import { Box2 } from '../../math/Box2.js';
import { Vector2 } from '../../math/Vector2.js';
import { Path } from './Path.js';
import { Shape } from './Shape.js';
import { ShapeUtils } from '../ShapeUtils.js';
import { warn } from '../../utils.js';

/**
 * This class is used to convert a series of paths to an array of
 * shapes. It is specifically used in context of fonts and SVG.
 */
class ShapePath {

	/**
	 * Constructs a new shape path.
	 */
	constructor() {

		this.type = 'ShapePath';

		/**
		 * The color of the shape.
		 *
		 * @type {Color}
		 */
		this.color = new Color();

		/**
		 * The paths that have been generated for this shape.
		 *
		 * @type {Array<Path>}
		 * @default null
		 */
		this.subPaths = [];

		/**
		 * The current path that is being generated.
		 *
		 * @type {?Path}
		 * @default null
		 */
		this.currentPath = null;

		/**
		 * An object that can be used to store custom data about the shape path.
		 * Mainly used by SVGLoader to store style information.
		 *
		 * @type {Object}
		 */
		this.userData = {};

	}

	/**
	 * Creates a new path and moves it current point to the given one.
	 *
	 * @param {number} x - The x coordinate.
	 * @param {number} y - The y coordinate.
	 * @return {ShapePath} A reference to this shape path.
	 */
	moveTo( x, y ) {

		this.currentPath = new Path();
		this.subPaths.push( this.currentPath );
		this.currentPath.moveTo( x, y );

		return this;

	}

	/**
	 * Adds an instance of {@link LineCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} x - The x coordinate of the end point.
	 * @param {number} y - The y coordinate of the end point.
	 * @return {ShapePath} A reference to this shape path.
	 */
	lineTo( x, y ) {

		this.currentPath.lineTo( x, y );

		return this;

	}

	/**
	 * Adds an instance of {@link QuadraticBezierCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} aCPx - The x coordinate of the control point.
	 * @param {number} aCPy - The y coordinate of the control point.
	 * @param {number} aX - The x coordinate of the end point.
	 * @param {number} aY - The y coordinate of the end point.
	 * @return {ShapePath} A reference to this shape path.
	 */
	quadraticCurveTo( aCPx, aCPy, aX, aY ) {

		this.currentPath.quadraticCurveTo( aCPx, aCPy, aX, aY );

		return this;

	}

	/**
	 * Adds an instance of {@link CubicBezierCurve} to the path by connecting
	 * the current point with the given one.
	 *
	 * @param {number} aCP1x - The x coordinate of the first control point.
	 * @param {number} aCP1y - The y coordinate of the first control point.
	 * @param {number} aCP2x - The x coordinate of the second control point.
	 * @param {number} aCP2y - The y coordinate of the second control point.
	 * @param {number} aX - The x coordinate of the end point.
	 * @param {number} aY - The y coordinate of the end point.
	 * @return {ShapePath} A reference to this shape path.
	 */
	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		this.currentPath.bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY );

		return this;

	}

	/**
	 * Adds an instance of {@link SplineCurve} to the path by connecting
	 * the current point with the given list of points.
	 *
	 * @param {Array<Vector2>} pts - An array of points in 2D space.
	 * @return {ShapePath} A reference to this shape path.
	 */
	splineThru( pts ) {

		this.currentPath.splineThru( pts );

		return this;

	}

	/**
	 * Converts the paths into an array of shapes.
	 *
	 * @return {Array<Shape>} An array of shapes.
	 */
	toShapes() {

		// Point-in-polygon test using the even-odd ray-casting rule. Valid for
		// simple (non self-intersecting) polygons.
		function pointInPolygon( p, polygon ) {

			let inside = false;
			const n = polygon.length;

			for ( let i = 0, j = n - 1; i < n; j = i ++ ) {

				const a = polygon[ i ];
				const b = polygon[ j ];

				if ( ( a.y > p.y ) !== ( b.y > p.y ) &&
							p.x < ( b.x - a.x ) * ( p.y - a.y ) / ( b.y - a.y ) + a.x ) {

					inside = ! inside;

				}

			}

			return inside;

		}

		// Returns a point guaranteed to be strictly inside the given simple
		// polygon. First tries the bounding-box center; if that falls outside
		// the polygon, casts a horizontal ray at the center's y and picks the
		// midpoint between the first two sorted intercepts.
		//
		// Port of paper.js' Path#getInteriorPoint()
		// https://github.com/paperjs/paper.js/blob/develop/src/path/PathItem.Boolean.js
		function getInteriorPoint( polygon, boundingBox ) {

			const point = boundingBox.getCenter( new Vector2() );

			if ( pointInPolygon( point, polygon ) ) return point;

			const y = point.y;
			const intercepts = [];
			const n = polygon.length;

			for ( let i = 0; i < n; i ++ ) {

				const a = polygon[ i ];
				const b = polygon[ ( i + 1 ) % n ];

				// Half-open crossing rule — counts each vertex exactly once and
				// skips horizontal edges.
				if ( ( a.y > y ) !== ( b.y > y ) ) {

					const x = a.x + ( y - a.y ) * ( b.x - a.x ) / ( b.y - a.y );
					intercepts.push( x );

				}

			}

			if ( intercepts.length > 1 ) {

				intercepts.sort( ( a, b ) => a - b );
				point.x = ( intercepts[ 0 ] + intercepts[ 1 ] ) / 2;

			}

			return point;

		}

		// Resolve fill-rule. Defaults to 'nonzero'.
		let fillRule = ( this.userData.style && this.userData.style.fillRule ) || 'nonzero';

		if ( fillRule !== 'nonzero' && fillRule !== 'evenodd' ) {

			warn( 'Fill-rule "' + fillRule + '" is not supported, falling back to "nonzero".' );
			fillRule = 'nonzero';

		}

		// Predicate that decides whether a winding number falls inside the fill
		// region, per the SVG fill-rule spec. Works for negative windings too,
		// because JavaScript's bitwise AND preserves odd/even under two's
		// complement.
		const isInside = fillRule === 'nonzero'
			? ( w => w !== 0 )
			: ( w => ( w & 1 ) !== 0 );

		// Build an entry per usable subpath. Self-winding follows the standard
		// convention used by ShapeUtils: counter-clockwise (signed area > 0)
		// contributes +1 to the winding number at an interior point,
		// clockwise contributes -1.
		const entries = [];

		for ( const subPath of this.subPaths ) {

			const points = subPath.getPoints();
			if ( points.length < 3 ) continue;

			const area = ShapeUtils.area( points );
			if ( area === 0 ) continue;

			const boundingBox = new Box2();
			for ( let i = 0; i < points.length; i ++ ) boundingBox.expandByPoint( points[ i ] );

			entries.push( {
				subPath: subPath,
				points: points,
				boundingBox: boundingBox,
				interiorPoint: getInteriorPoint( points, boundingBox ),
				absArea: Math.abs( area ),
				winding: area < 0 ? - 1 : 1,
				container: null,
				exclude: false,
				role: null
			} );

		}

		// Sort by area descending. This guarantees that any subpath that could
		// contain `entries[i]` is located at a smaller index and has already
		// been processed when it's entries[i]'s turn. Port of paper.js'
		// reorientPaths() algorithm.
		entries.sort( ( a, b ) => b.absArea - a.absArea );

		// Walk already-processed entries from closest-in-size to largest,
		// stopping at the innermost container. Accumulate the container's
		// cumulative winding into this entry's winding so that the final value
		// equals the winding number at this entry's interior point.
		//
		// A subpath only contributes to the fill boundary when crossing it
		// actually flips the "insideness" per the fill rule; otherwise it's a
		// redundant overlap and gets excluded to avoid double-counting.
		for ( let i = 0; i < entries.length; i ++ ) {

			const entry = entries[ i ];
			let containerWinding = 0;

			for ( let j = i - 1; j >= 0; j -- ) {

				const candidate = entries[ j ];

				if ( ! candidate.boundingBox.containsBox( entry.boundingBox ) ) continue;
				if ( ! pointInPolygon( entry.interiorPoint, candidate.points ) ) continue;

				entry.container = candidate.exclude ? candidate.container : candidate;
				containerWinding = candidate.winding;
				entry.winding += containerWinding;
				break;

			}

			if ( isInside( entry.winding ) === isInside( containerWinding ) ) {

				entry.exclude = true;

			}

		}

		// Classify retained entries. An entry is an outer shape if it has no
		// container or if its container is itself a hole (a solid nested inside
		// a hole becomes a new top-level shape); otherwise it's a hole in its
		// container. Entries were already sorted outermost-first, so each
		// container's role is known by the time we look at it.
		for ( const entry of entries ) {

			if ( entry.exclude ) continue;
			entry.role = ( entry.container === null || entry.container.role === 'hole' ) ? 'outer' : 'hole';

		}

		// Build Shapes for outers first, then attach holes to their container's
		// Shape.
		const shapes = [];
		const shapeByEntry = new Map();

		for ( const entry of entries ) {

			if ( entry.exclude || entry.role !== 'outer' ) continue;

			const shape = new Shape();
			shape.curves = entry.subPath.curves;
			shapes.push( shape );
			shapeByEntry.set( entry, shape );

		}

		for ( const entry of entries ) {

			if ( entry.exclude || entry.role !== 'hole' ) continue;

			const shape = shapeByEntry.get( entry.container );
			if ( ! shape ) continue;

			const hole = new Path();
			hole.curves = entry.subPath.curves;
			shape.holes.push( hole );

		}

		return shapes;


	}

}


export { ShapePath };
