/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/

THREE.Path = function ( points ) {

	THREE.CurvePath.call(this);

	this.actions = [];

	if ( points ) {

		this.fromPoints( points );

	}

};

THREE.Path.prototype = new THREE.CurvePath();
THREE.Path.prototype.constructor = THREE.Path;


THREE.PathActions = {

	MOVE_TO: 'moveTo',
	LINE_TO: 'lineTo',
	QUADRATIC_CURVE_TO: 'quadraticCurveTo', // Bezier quadratic curve
	BEZIER_CURVE_TO: 'bezierCurveTo', 		// Bezier cubic curve
	CSPLINE_THRU: 'splineThru',				// Catmull-rom spline
	ARC: 'arc'								// Circle

};

// TODO Clean up PATH API

// Create path using straight lines to connect all points
// - vectors: array of Vector2

THREE.Path.prototype.fromPoints = function ( vectors ) {

	this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

	for ( var v = 1, vlen = vectors.length; v < vlen; v ++ ) {

		this.lineTo( vectors[ v ].x, vectors[ v ].y );

	};

};

// startPath() endPath()?

THREE.Path.prototype.moveTo = function ( x, y ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args } );

};

THREE.Path.prototype.lineTo = function ( x, y ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.LineCurve( new THREE.Vector2( x0, y0 ), new THREE.Vector2( x, y ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args } );

};

THREE.Path.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.QuadraticBezierCurve( new THREE.Vector2( x0, y0 ),
												new THREE.Vector2( aCPx, aCPy ),
												new THREE.Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args } );

};

THREE.Path.prototype.bezierCurveTo = function( aCP1x, aCP1y,
                                               aCP2x, aCP2y,
                                               aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.CubicBezierCurve( new THREE.Vector2( x0, y0 ),
											new THREE.Vector2( aCP1x, aCP1y ),
											new THREE.Vector2( aCP2x, aCP2y ),
											new THREE.Vector2( aX, aY ) );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.BEZIER_CURVE_TO, args: args } );

};

THREE.Path.prototype.splineThru = function( pts /*Array of Vector*/ ) {

	var args = Array.prototype.slice.call( arguments );
	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];
//---
	var npts = [ new THREE.Vector2( x0, y0 ) ];
	Array.prototype.push.apply( npts, pts );

	var curve = new THREE.SplineCurve( npts );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.CSPLINE_THRU, args: args } );

};

// FUTURE: Change the API or follow canvas API?
// TODO ARC ( x, y, x - radius, y - radius, startAngle, endAngle )

THREE.Path.prototype.arc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );

	var laste = this.actions[ this.actions.length - 1];

	var curve = new THREE.ArcCurve( laste.x + aX, laste.y + aY, aRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );

	// All of the other actions look to the last two elements in the list to
	// find the ending point, so we need to append them.
	var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
	args.push(lastPoint.x);
	args.push(lastPoint.y);

	this.actions.push( { action: THREE.PathActions.ARC, args: args } );

 };

THREE.Path.prototype.absarc = function ( aX, aY, aRadius,
									  aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );

	var curve = new THREE.ArcCurve( aX, aY, aRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );

	// console.log( 'arc', args );

        // All of the other actions look to the last two elements in the list to
        // find the ending point, so we need to append them.
        var lastPoint = curve.getPoint(aClockwise ? 1 : 0);
        args.push(lastPoint.x);
        args.push(lastPoint.y);

	this.actions.push( { action: THREE.PathActions.ARC, args: args } );

 };


THREE.Path.prototype.getSpacedPoints = function ( divisions, closedPath ) {

	if ( ! divisions ) divisions = 40;

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

THREE.Path.prototype.getPoints = function( divisions, closedPath ) {

	if (this.useSpacedPoints) {
		console.log('tata');
		return this.getSpacedPoints( divisions, closedPath );
	}

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		action = item.action;
		args = item.args;

		switch( action ) {

		case THREE.PathActions.MOVE_TO:

			points.push( new THREE.Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case THREE.PathActions.LINE_TO:

			points.push( new THREE.Vector2( args[ 0 ], args[ 1 ] ) );

			break;

		case THREE.PathActions.QUADRATIC_CURVE_TO:

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

				tx = THREE.Shape.Utils.b2( t, cpx0, cpx1, cpx );
				ty = THREE.Shape.Utils.b2( t, cpy0, cpy1, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

		  	}

			break;

		case THREE.PathActions.BEZIER_CURVE_TO:

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

				tx = THREE.Shape.Utils.b3( t, cpx0, cpx1, cpx2, cpx );
				ty = THREE.Shape.Utils.b3( t, cpy0, cpy1, cpy2, cpy );

				points.push( new THREE.Vector2( tx, ty ) );

			}

			break;

		case THREE.PathActions.CSPLINE_THRU:

			laste = this.actions[ i - 1 ].args;

			var last = new THREE.Vector2( laste[ laste.length - 2 ], laste[ laste.length - 1 ] );
			var spts = [ last ];

			var n = divisions * args[ 0 ].length;

			spts = spts.concat( args[ 0 ] );

			var spline = new THREE.SplineCurve( spts );

			for ( j = 1; j <= n; j ++ ) {

				points.push( spline.getPointAt( j / n ) ) ;

			}

			break;

		case THREE.PathActions.ARC:

			laste = this.actions[ i - 1 ].args;

			var aX = args[ 0 ], aY = args[ 1 ],
				aRadius = args[ 2 ],
				aStartAngle = args[ 3 ], aEndAngle = args[ 4 ],
				aClockwise = !!args[ 5 ];


			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( ! aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = aX + aRadius * Math.cos( angle );
				ty = aY + aRadius * Math.sin( angle );

				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);

				points.push( new THREE.Vector2( tx, ty ) );

			}

			//console.log(points);

		  break;

		} // end switch

	}



	// Normalize to remove the closing point by default.
	var lastPoint = points[ points.length - 1];
	var EPSILON = 0.0000000001;
	if ( Math.abs(lastPoint.x - points[ 0 ].x) < EPSILON &&
             Math.abs(lastPoint.y - points[ 0 ].y) < EPSILON)
		points.splice( points.length - 1, 1);
	if ( closedPath ) {

		points.push( points[ 0 ] );

	}

	return points;

};



// This was used for testing purposes. Should be removed soon.

THREE.Path.prototype.transform = function( path, segments ) {

	var bounds = this.getBoundingBox();
	var oldPts = this.getPoints( segments ); // getPoints getSpacedPoints

	//console.log( path.cacheArcLengths() );
	//path.getLengths(400);
	//segments = 40;

	return this.getWrapPoints( oldPts, path );

};

// Read http://www.tinaja.com/glib/nonlingr.pdf
// nonlinear transforms

THREE.Path.prototype.nltransform = function( a, b, c, d, e, f ) {

	// a - horizontal size
	// b - lean
	// c - x offset
	// d - vertical size
	// e - climb
	// f - y offset

	var oldPts = this.getPoints();

	var i, il, p, oldX, oldY;

	for ( i = 0, il = oldPts.length; i < il; i ++ ) {

		p = oldPts[i];

		oldX = p.x;
		oldY = p.y;

		p.x = a * oldX + b * oldY + c;
		p.y = d * oldY + e * oldX + f;

	}

	return oldPts;

};


// FUTURE Export JSON Format

/* Draws this path onto a 2d canvas easily */

THREE.Path.prototype.debug = function( canvas ) {

	var bounds = this.getBoundingBox();

	if ( !canvas ) {

		canvas = document.createElement( "canvas" );

		canvas.setAttribute( 'width',  bounds.maxX + 100 );
		canvas.setAttribute( 'height', bounds.maxY + 100 );

		document.body.appendChild( canvas );

	}

	var ctx = canvas.getContext( "2d" );
	ctx.fillStyle = "white";
	ctx.fillRect( 0, 0, canvas.width, canvas.height );

	ctx.strokeStyle = "black";
	ctx.beginPath();

	var i, il, item, action, args;

	// Debug Path

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		args = item.args;
		action = item.action;

		// Short hand for now

		if ( action != THREE.PathActions.CSPLINE_THRU ) {

			ctx[ action ].apply( ctx, args );

		}

		/*
		switch ( action ) {

			case THREE.PathActions.MOVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ] );
				break;

			case THREE.PathActions.LINE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ] );
				break;

			case THREE.PathActions.QUADRATIC_CURVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ] );
				break;

			case THREE.PathActions.CUBIC_CURVE_TO:

				ctx[ action ]( args[ 0 ], args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ] );
				break;

		}
		*/

	}

	ctx.stroke();
	ctx.closePath();

	// Debug Points

	ctx.strokeStyle = "red";

	/* TO CLEAN UP */

	var p, points = this.getPoints();

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		ctx.beginPath();
		ctx.arc( p.x, p.y, 1.5, 0, Math.PI * 2, false );
		ctx.stroke();
		ctx.closePath();

	}

};

// Breaks path into shapes

THREE.Path.prototype.toShapes = function() {

	var i, il, item, action, args;

	var subPaths = [], lastPath = new THREE.Path();

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		args = item.args;
		action = item.action;

		if ( action == THREE.PathActions.MOVE_TO ) {

			if ( lastPath.actions.length != 0 ) {

				subPaths.push( lastPath );
				lastPath = new THREE.Path();

			}

		}

		lastPath[ action ].apply( lastPath, args );

	}

	if ( lastPath.actions.length != 0 ) {

		subPaths.push( lastPath );

	}

	// console.log(subPaths);

	if ( subPaths.length == 0 ) return [];

	var tmpPath, tmpShape, shapes = [];

	var holesFirst = !THREE.Shape.Utils.isClockWise( subPaths[ 0 ].getPoints() );
	// console.log("Holes first", holesFirst);

	if ( subPaths.length == 1) {
		tmpPath = subPaths[0];
		tmpShape = new THREE.Shape();
		tmpShape.actions = tmpPath.actions;
		tmpShape.curves = tmpPath.curves;
		shapes.push( tmpShape );
		return shapes;
	};

	if ( holesFirst ) {

		tmpShape = new THREE.Shape();

		for ( i = 0, il = subPaths.length; i < il; i ++ ) {

			tmpPath = subPaths[ i ];

			if ( THREE.Shape.Utils.isClockWise( tmpPath.getPoints() ) ) {

				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;

				shapes.push( tmpShape );
				tmpShape = new THREE.Shape();

				//console.log('cw', i);

			} else {

				tmpShape.holes.push( tmpPath );

				//console.log('ccw', i);

			}

		}

	} else {

		// Shapes first

		for ( i = 0, il = subPaths.length; i < il; i ++ ) {

			tmpPath = subPaths[ i ];

			if ( THREE.Shape.Utils.isClockWise( tmpPath.getPoints() ) ) {


				if ( tmpShape ) shapes.push( tmpShape );

				tmpShape = new THREE.Shape();
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;

			} else {

				tmpShape.holes.push( tmpPath );

			}

		}

		shapes.push( tmpShape );

	}

	//console.log("shape", shapes);

	return shapes;

};
