/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 */

module.exports = Path;

var CurvePath = require( "./CurvePath" ),
	ShapeUtils = require( "../ShapeUtils" ),
	CubicBezierCurve = require( "../curves/CubicBezierCurve" ),
	EllipseCurve = require( "../curves/EllipseCurve" ),
	LineCurve = require( "../curves/LineCurve" ),
	QuadraticBezierCurve = require( "../curves/QuadraticBezierCurve" ),
	SplineCurve = require( "../curves/SplineCurve" ),
	Vector2 = require( "../../math/Vector2" );

function Path( points ) {

	CurvePath.call( this );

	this.actions = [];

	if ( points ) {

		this.fromPoints( points );

	}

}

Path.prototype = Object.create( CurvePath.prototype );
Path.prototype.constructor = Path;

Path.Actions = {

	MOVE_TO: "moveTo",
	LINE_TO: "lineTo",
	QUADRATIC_CURVE_TO: "quadraticCurveTo", // Bezier quadratic curve
	BEZIER_CURVE_TO: "bezierCurveTo", // Bezier cubic curve
	CSPLINE_THRU: "splineThru", // Catmull-rom spline
	ARC: "arc", // Circle
	ELLIPSE: "ellipse"

};

// TODO Clean up PATH API

// Create path using straight lines to connect all points
// - vectors: array of Vector2

Path.prototype.fromPoints = function ( vectors ) {

	this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

	for ( var v = 1, vlen = vectors.length; v < vlen; v ++ ) {

		this.lineTo( vectors[ v ].x, vectors[ v ].y );

	}

};

// startPath() endPath()?

Path.prototype.moveTo = function () {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: Path.Actions.MOVE_TO, args: args } );

};

Path.prototype.lineTo = function ( x, y ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new LineCurve( new Vector2( x0, y0 ), new Vector2( x, y ) );
	this.curves.push( curve );

	this.actions.push( { action: Path.Actions.LINE_TO, args: args } );

};

Path.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new QuadraticBezierCurve( new Vector2( x0, y0 ), new Vector2( aCPx, aCPy ), new Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: Path.Actions.QUADRATIC_CURVE_TO, args: args } );

};

Path.prototype.bezierCurveTo = function( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new CubicBezierCurve( new Vector2( x0, y0 ), new Vector2( aCP1x, aCP1y ), new Vector2( aCP2x, aCP2y ), new Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: Path.Actions.BEZIER_CURVE_TO, args: args } );

};

Path.prototype.splineThru = function( pts /*Array of Vector*/ ) {

	var args = Array.prototype.slice.call( arguments );
	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];
	//---
	var npts = [ new Vector2( x0, y0 ) ];
	Array.prototype.push.apply( npts, pts );

	var curve = new SplineCurve( npts );
	this.curves.push( curve );

	this.actions.push( { action: Path.Actions.CSPLINE_THRU, args: args } );

};

// FUTURE: Change the API or follow canvas API?

Path.prototype.arc = function ( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	var lastargs = this.actions[ this.actions.length - 1 ].args;
	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	this.absarc( aX + x0, aY + y0, aRadius, aStartAngle, aEndAngle, aClockwise );

 };

Path.prototype.absarc = function ( aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise ) {

	this.absellipse( aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise );

};

Path.prototype.ellipse = function ( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

	var lastargs = this.actions[ this.actions.length - 1 ].args;
	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	this.absellipse( aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

};


Path.prototype.absellipse = function ( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation ) {

	var args = [
		aX, aY,
		xRadius, yRadius,
		aStartAngle, aEndAngle,
		aClockwise,
		aRotation || 0 // aRotation is optional.
	];

	var curve = new EllipseCurve( aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation );

	this.curves.push( curve );

	var lastPoint = curve.getPoint( 1 );
	args.push( lastPoint.x );
	args.push( lastPoint.y );

	this.actions.push( { action: Path.Actions.ELLIPSE, args: args } );

 };

Path.prototype.getSpacedPoints = function ( divisions /*, closedPath */ ) {

	if ( ! divisions ) { divisions = 40; }

	var points = [];

	for ( var i = 0; i < divisions; i ++ ) {

		points.push( this.getPoint( i / divisions ) );

		//if( !this.getPoint( i / divisions ) ) throw "DIE";

	}

	// if ( closedPath ) {
	//
	// 	points.push( points[ 0 ] );
	//
	// }

	return points;

};

/* Return an array of vectors based on contour of the path */

Path.prototype.getPoints = function( divisions, closedPath ) {

	if ( this.useSpacedPoints ) {

		return this.getSpacedPoints( divisions, closedPath );

	}

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	var aX, aY,
		aRadius, xRadius, yRadius,
		aStartAngle, aEndAngle,
		aClockwise, aRotation,
		cos, sin, x, y,
		deltaAngle, angle,
		tdivisions;

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		action = item.action;
		args = item.args;

		switch ( action ) {

		case Path.Actions.MOVE_TO:

			points.push( new Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case Path.Actions.LINE_TO:

			points.push( new Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case Path.Actions.QUADRATIC_CURVE_TO:

			cpx  = args[ 2 ];
			cpy  = args[ 3 ];

			cpx1 = args[ 0 ];
			cpy1 = args[ 1 ];

			if ( points.length > 0 ) {

				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;

			} else {

				laste = this.actions[ i - 1 ].args;

				cpx0 = laste[ laste.length - 2 ];
				cpy0 = laste[ laste.length - 1 ];

			}

			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = ShapeUtils.b2( t, cpx0, cpx1, cpx );
				ty = ShapeUtils.b2( t, cpy0, cpy1, cpy );

				points.push( new Vector2( tx, ty ) );

			}

			break;

		case Path.Actions.BEZIER_CURVE_TO:

			cpx  = args[ 4 ];
			cpy  = args[ 5 ];

			cpx1 = args[ 0 ];
			cpy1 = args[ 1 ];

			cpx2 = args[ 2 ];
			cpy2 = args[ 3 ];

			if ( points.length > 0 ) {

				laste = points[ points.length - 1 ];

				cpx0 = laste.x;
				cpy0 = laste.y;

			} else {

				laste = this.actions[ i - 1 ].args;

				cpx0 = laste[ laste.length - 2 ];
				cpy0 = laste[ laste.length - 1 ];

			}


			for ( j = 1; j <= divisions; j ++ ) {

				t = j / divisions;

				tx = ShapeUtils.b3( t, cpx0, cpx1, cpx2, cpx );
				ty = ShapeUtils.b3( t, cpy0, cpy1, cpy2, cpy );

				points.push( new Vector2( tx, ty ) );

			}

			break;

		case Path.Actions.CSPLINE_THRU:

			laste = this.actions[ i - 1 ].args;

			var last = new Vector2( laste[ laste.length - 2 ], laste[ laste.length - 1 ] );
			var spts = [ last ];

			var n = divisions * args[ 0 ].length;

			spts = spts.concat( args[ 0 ] );

			var spline = new SplineCurve( spts );

			for ( j = 1; j <= n; j ++ ) {

				points.push( spline.getPointAt( j / n ) );

			}

			break;

		case Path.Actions.ARC:

			aX = args[ 0 ]; aY = args[ 1 ];
			aRadius = args[ 2 ];
			aStartAngle = args[ 3 ]; aEndAngle = args[ 4 ];
			aClockwise = !! args[ 5 ];

			deltaAngle = aEndAngle - aStartAngle;
			tdivisions = divisions * 2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + aRadius * Math.cos( angle );
				ty = aY + aRadius * Math.sin( angle );

				//console.log( "t", t, "angle", angle, "tx", tx, "ty", ty );

				points.push( new Vector2( tx, ty ) );

			}

			//console.log(points);

			break;

		case Path.Actions.ELLIPSE:

			aX = args[ 0 ]; aY = args[ 1 ];
			xRadius = args[ 2 ];
			yRadius = args[ 3 ];
			aStartAngle = args[ 4 ]; aEndAngle = args[ 5 ];
			aClockwise = !! args[ 6 ];
			aRotation = args[ 7 ];

			deltaAngle = aEndAngle - aStartAngle;
			tdivisions = divisions * 2;

			if ( aRotation !== 0 ) {
		
				cos = Math.cos( aRotation );
				sin = Math.sin( aRotation );

			}

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + xRadius * Math.cos( angle );
				ty = aY + yRadius * Math.sin( angle );

				if ( aRotation !== 0 ) {

					x = tx; y = ty;

					// Rotate the point about the center of the ellipse.
					tx = ( x - aX ) * cos - ( y - aY ) * sin + aX;
					ty = ( x - aX ) * sin + ( y - aY ) * cos + aY;

				}

				//console.log( "t", t, "angle", angle, "tx", tx, "ty", ty );

				points.push( new Vector2( tx, ty ) );

			}

			//console.log( points );

			break;

		} // end switch

	}



	// Normalize to remove the closing point by default.
	var lastPoint = points[ points.length - 1 ];
	var EPSILON = 0.0000000001;

	if ( Math.abs(lastPoint.x - points[ 0 ].x) < EPSILON && Math.abs(lastPoint.y - points[ 0 ].y) < EPSILON) {

		points.splice( points.length - 1, 1 );

	}

	if ( closedPath ) {

		points.push( points[ 0 ] );

	}

	return points;

};

/**
 * Breaks path into shapes
 *
 *	Assumptions (if parameter isCCW==true the opposite holds):
 *	- solid shapes are defined clockwise (CW)
 *	- holes are defined counterclockwise (CCW)
 *
 *	If parameter noHoles==true:
 *  - all subPaths are regarded as solid shapes
 *  - definition order CW/CCW has no relevance
 */

Path.prototype.toShapes = function( isCCW, noHoles ) {

	// late definition, because this is a cyclic dependency and would
	// otherwise short-circuit the inheritance chain: Shape <-> Path -x-> CurvePath -> Curve.
	var Shape = require( "./Shape" );

	function extractSubpaths( inActions ) {

		var i, il, item, action, args;

		var subPaths = [], lastPath = new Path();

		for ( i = 0, il = inActions.length; i < il; i ++ ) {

			item = inActions[ i ];

			args = item.args;
			action = item.action;

			if ( action === Path.Actions.MOVE_TO ) {

				if ( lastPath.actions.length !== 0 ) {

					subPaths.push( lastPath );
					lastPath = new Path();

				}

			}

			lastPath[ action ].apply( lastPath, args );

		}

		if ( lastPath.actions.length !== 0 ) {

			subPaths.push( lastPath );

		}

		// console.log( subPaths );

		return subPaths;

	}

	function toShapesNoHoles( inSubpaths ) {

		var shapes = [];

		for ( var i = 0, il = inSubpaths.length; i < il; i ++ ) {

			var tmpPath = inSubpaths[ i ];

			var tmpShape = new Shape();
			tmpShape.actions = tmpPath.actions;
			tmpShape.curves = tmpPath.curves;

			shapes.push( tmpShape );

		}

		//console.log( "shape", shapes );

		return shapes;

	}

	function isPointInsidePolygon( inPt, inPolygon ) {

		var EPSILON = 0.0000000001;

		var polyLen = inPolygon.length;

		// inPt on polygon contour => immediate success or
		// toggling of inside/outside at every single! intersection point of an edge
		// with the horizontal line through inPt, left of inPt
		// not counting lowerY endpoints of edges and whole edges on that line
		var inside = false;

		for ( var p = polyLen - 1, q = 0; q < polyLen; p = q ++ ) {

			var edgeLowPt  = inPolygon[ p ];
			var edgeHighPt = inPolygon[ q ];

			var edgeDx = edgeHighPt.x - edgeLowPt.x;
			var edgeDy = edgeHighPt.y - edgeLowPt.y;

			if ( Math.abs( edgeDy ) > EPSILON ) {

				// not parallel
				if ( edgeDy < 0 ) {

					edgeLowPt  = inPolygon[ q ]; edgeDx = - edgeDx;
					edgeHighPt = inPolygon[ p ]; edgeDy = - edgeDy;

				}

				if ( ( inPt.y < edgeLowPt.y ) || ( inPt.y > edgeHighPt.y ) ) { continue; }

				if ( inPt.y === edgeLowPt.y ) {

					if ( inPt.x === edgeLowPt.x ) { return true; } // inPt is on contour ?
					// continue; // no intersection or edgeLowPt => doesn't count !!!

				} else {

					var perpEdge = edgeDy * (inPt.x - edgeLowPt.x) - edgeDx * (inPt.y - edgeLowPt.y);
					if ( perpEdge === 0 ) { return true; } // inPt is on contour ?
					if ( perpEdge < 0 ) { continue; }
					inside = ! inside; // true intersection left of inPt

				}

			} else {

				// parallel or collinear
				if ( inPt.y !== edgeLowPt.y ) { continue; } // parallel

				// edge lies on the same horizontal line as inPt
				if ( ( ( edgeHighPt.x <= inPt.x ) && ( inPt.x <= edgeLowPt.x ) ) ||
					 ( ( edgeLowPt.x <= inPt.x ) && ( inPt.x <= edgeHighPt.x ) ) ) { return true; } // inPt: Point on contour !
				// continue;

			}

		}

		return	inside;

	}


	var subPaths = extractSubpaths( this.actions );
	if ( subPaths.length === 0 ) { return []; }

	if ( noHoles === true ) { return toShapesNoHoles( subPaths ); }

	var solid, tmpPath, tmpShape, shapes = [];

	if ( subPaths.length === 1 ) {

		tmpPath = subPaths[ 0 ];
		tmpShape = new Shape();
		tmpShape.actions = tmpPath.actions;
		tmpShape.curves = tmpPath.curves;
		shapes.push( tmpShape );
		return shapes;

	}

	var holesFirst = ! ShapeUtils.isClockWise( subPaths[ 0 ].getPoints() );
	holesFirst = isCCW ? ! holesFirst : holesFirst;

	// console.log( "Holes first", holesFirst );

	var betterShapeHoles = [];
	var newShapes = [];
	var newShapeHoles = [];
	var mainIdx = 0;
	var tmpPoints;

	newShapes[ mainIdx ] = undefined;
	newShapeHoles[ mainIdx ] = [];

	var i, il;

	for ( i = 0, il = subPaths.length; i < il; i ++ ) {

		tmpPath = subPaths[ i ];
		tmpPoints = tmpPath.getPoints();
		solid = ShapeUtils.isClockWise( tmpPoints );
		solid = isCCW ? ! solid : solid;

		if ( solid ) {

			if ( ( ! holesFirst ) && ( newShapes[ mainIdx ] ) ) { mainIdx ++; }

			newShapes[ mainIdx ] = { s: new Shape(), p: tmpPoints };
			newShapes[ mainIdx ].s.actions = tmpPath.actions;
			newShapes[ mainIdx ].s.curves = tmpPath.curves;
			
			if ( holesFirst ) { mainIdx ++; }
			newShapeHoles[ mainIdx ] = [];

			//console.log( "cw", i );

		} else {

			newShapeHoles[ mainIdx ].push( { h: tmpPath, p: tmpPoints[ 0 ] } );

			//console.log( "ccw", i );

		}

	}

	// only Holes? -> probably all Shapes with wrong orientation
	if ( ! newShapes[ 0 ] ) { return toShapesNoHoles( subPaths ); }

	if ( newShapes.length > 1 ) {

		var ambiguous = false;
		var toChange = [];
		var sIdx, sLen;

		for ( sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++ ) {

			betterShapeHoles[ sIdx ] = [];

		}

		for ( sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx ++ ) {

			var sho = newShapeHoles[ sIdx ];

			for ( var hIdx = 0; hIdx < sho.length; hIdx ++ ) {

				var ho = sho[ hIdx ];
				var hole_unassigned = true;

				for ( var s2Idx = 0; s2Idx < newShapes.length; s2Idx ++ ) {

					if ( isPointInsidePolygon( ho.p, newShapes[ s2Idx ].p ) ) {

						if ( sIdx !== s2Idx ) { toChange.push( { froms: sIdx, tos: s2Idx, hole: hIdx } ); }

						if ( hole_unassigned ) {

							hole_unassigned = false;
							betterShapeHoles[ s2Idx ].push( ho );

						} else {

							ambiguous = true;

						}

					}

				}

				if ( hole_unassigned ) {

					betterShapeHoles[ sIdx ].push( ho );

				}

			}

		}

		// console.log( "ambiguous: ", ambiguous );

		if ( toChange.length > 0 ) {

			// console.log( "to change: ", toChange );
			if ( ! ambiguous ) { newShapeHoles = betterShapeHoles; }

		}

	}

	var tmpHoles, j, jl;

	for ( i = 0, il = newShapes.length; i < il; i ++ ) {

		tmpShape = newShapes[ i ].s;
		shapes.push( tmpShape );
		tmpHoles = newShapeHoles[ i ];

		for ( j = 0, jl = tmpHoles.length; j < jl; j ++ ) {

			tmpShape.holes.push( tmpHoles[ j ].h );

		}

	}

	//console.log("shape", shapes);

	return shapes;

};
