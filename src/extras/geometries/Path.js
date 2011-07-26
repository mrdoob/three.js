/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/

THREE.Path = function ( points ) {

	this.actions = [];
	this.curves = [];

	if ( points ) {

		this.fromPoints( points );

	}

};

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

THREE.Path.prototype.fromPoints = function( vectors ) {

	this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

	var v, vlen = vectors.length;

	for ( v = 1; v < vlen; v++ ) {

		this.lineTo( vectors[ v ].x, vectors[ v ].y );

	};

};

// startPath() endPath()?

THREE.Path.prototype.moveTo = function( x, y ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args } );

};

THREE.Path.prototype.lineTo = function( x, y ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.LineCurve( x0, y0, x, y );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args, curve: curve } );

};

THREE.Path.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.QuadraticBezierCurve( x0, y0, aCPx, aCPy, aX, aY );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args, curve: curve } );

	//console.log(curve, curve.getPoints(), curve.getSpacedPoints());
	//console.log(curve.getPointAt(0), curve.getPointAt(0),curve.getUtoTmapping(0), curve.getSpacedPoints());

};

THREE.Path.prototype.bezierCurveTo = function( aCP1x, aCP1y,
                                               aCP2x, aCP2y,
                                               aX, aY ) {

	var args = Array.prototype.slice.call( arguments );

	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var curve = new THREE.CubicBezierCurve( x0, y0, aCP1x, aCP1y,
	                                                aCP2x, aCP2y,
	                                                aX, aY );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.BEZIER_CURVE_TO, args: args, curve: curve } );

};

THREE.Path.prototype.splineThru = function( pts /*Array of Vector*/ ) {

	var args = Array.prototype.slice.call( arguments );
	var lastargs = this.actions[ this.actions.length - 1 ].args;

	var x0 = lastargs[ lastargs.length - 2 ];
	var y0 = lastargs[ lastargs.length - 1 ];

	var npts = [ new THREE.Vector2( x0, y0 ) ];
	npts =  npts.concat( pts );

	var curve = new THREE.SplineCurve( npts );
	this.curves.push( curve );

	this.actions.push( { action: THREE.PathActions.CSPLINE_THRU, args: args, curve: curve } );

	//console.log(curve, curve.getPoints(), curve.getSpacedPoints());

};

// FUTURE: Change the API or follow canvas API?
// TODO ARC ( x, y, x - radius, y - radius, startAngle, endAngle )

THREE.Path.prototype.arc = function(aX, aY, aRadius,
									aStartAngle, aEndAngle, aClockwise ) {

	var args = Array.prototype.slice.call( arguments );
	var curve = new THREE.ArcCurve( aX, aY, aRadius,
									aStartAngle, aEndAngle, aClockwise );
	this.curves.push( curve );
	//console.log('arc', args);
	this.actions.push( { action: THREE.PathActions.ARC, args: args } );

 };

/*
// FUTURE ENHANCEMENTS

 example usage?

 Path.addExprFunc('sineCurveTo', sineCurveGetPtFunction)
 Path.sineCurveTo(x,y, amptitude);
 sineCurve.getPoint(t);
 return sine(disnt) * ampt

 // Create a new func eg. sin (theta) x
 THREE.Path.prototype.addExprFunc = function(exprName, func) {
 };
*/


THREE.Path.prototype.getSpacedPoints = function( divisions ) {

	if ( !divisions ) divisions = 40;

	var pts = [];
	for ( var i = 0; i < divisions; i++ ) {

		pts.push( this.getPoint( i / divisions ) );

		//if(!this.getPoint(i/divisions)) throw "DIE";

	}

	//console.log(pts);
	return pts;

};

/* Return an array of vectors based on contour of the path */

THREE.Path.prototype.getPoints = function( divisions ) {

	divisions = divisions || 12;

	var points = [];

	var i, il, item, action, args;
	var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
		laste, j,
		t, tx, ty;

	for ( i = 0, il = this.actions.length; i < il; i++ ) {

		item = this.actions[ i ];

		action = item.action;
		args = item.args;

		switch( action ) {

		case THREE.PathActions.MOVE_TO:

			//points.push( new THREE.Vector2( args[ 0 ], args[ 1 ] ) );

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

				tx = THREE.FontUtils.b2( t, cpx0, cpx1, cpx );
				ty = THREE.FontUtils.b2( t, cpy0, cpy1, cpy );

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

				tx = THREE.FontUtils.b3( t, cpx0, cpx1, cpx2, cpx );
				ty = THREE.FontUtils.b3( t, cpy0, cpy1, cpy2, cpy );

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

			var lastx = laste[ laste.length - 2 ],
				lasty = laste[ laste.length - 1 ];

			if ( laste.length == 0 ) {

				lastx = lasty = 0;

			}


			var deltaAngle = aEndAngle - aStartAngle;
			var angle;
			var tdivisions = divisions * 2;
			var t;

			for ( j = 1; j <= tdivisions; j ++ ) {

				t = j / tdivisions;

				if ( !aClockwise ) {

					t = 1 - t;

				}

				angle = aStartAngle + t * deltaAngle;

				tx = lastx + aX + aRadius * Math.cos( angle );
				ty = lasty + aY + aRadius * Math.sin( angle );

				//console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);

				points.push( new THREE.Vector2( tx, ty ) );

			}

			//console.log(points);

		  break;

		} // end switch

	}

	return points;

};

THREE.Path.prototype.getMinAndMax = function() {

	var points = this.getPoints();

	var maxX, maxY;
	var minX, minY;

	maxX = maxY = Number.NEGATIVE_INFINITY;
	minX = minY = Number.POSITIVE_INFINITY;

	var p, i, il;

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		if ( p.x > maxX ) maxX = p.x;
		else if ( p.x < minX ) minX = p.x;

		if ( p.y > maxY ) maxY = p.y;
		else if ( p.y < maxY ) minY = p.y;

	}

	// TODO Include CG or find mid-pt?

	return {

		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY

	};

};


// To get accurate point with reference to
// entire path distance at time t,
// following has to be done

// 1. Length of each sub path have to be known
// 2. Locate and identify type of curve
// 3. Get t for the curve
// 4. Return curve.getPointAt(t')

THREE.Path.prototype.getPoint = function( t ) {

	var d = t * this.getLength();
	var curveLengths = this.sums;
	var i = 0, diff, curve;

	// To think about boundaries points.

	while ( i < curveLengths.length ) {

		if ( curveLengths[ i ] >= d) {

			diff = curveLengths[ i ] - d;
			curve = this.curves[ i ];

			var u = 1 - diff / curve.getLength();

			return curve.getPointAt( u );

			break;
		}

		i++;

	}

	return null;

	// loop where sum != 0, sum > d , sum+1 <d

};

// Compute lengths and cache them

THREE.Path.prototype.getLength = function() {

	// Loop all actions/path
	// Push sums into cached array

	var lengths = [], sums = 0;
	var i, il = this.curves.length;

	for ( i = 0; i < il ; i++ ) {

		sums += this.curves[ i ].getLength();
		lengths.push( sums );

	}

	this.sums = lengths;

	return sums;

};

// TODO: rewrite to use single Line object

// createPathGeometry by SolarCoordinates

/* Returns Object3D with line segments stored as children  */

THREE.Path.prototype.createPathGeometry = function( divisions, lineMaterial ) {

    var pts = this.getPoints( divisions );

    var segment, pathGeometry = new THREE.Object3D;
    if ( !lineMaterial ) lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.7 } );

    for( var i = 1; i < pts.length; i++ ) {

        var pathSegment = new THREE.Geometry();
        pathSegment.vertices.push( new THREE.Vertex( new THREE.Vector3( pts[i-1].x, pts[i-1].y, 0 ) ) );
        pathSegment.vertices.push( new THREE.Vertex( new THREE.Vector3( pts[i].x, pts[i].y, 0) ) );
        segment = new THREE.Line( pathSegment , lineMaterial );
        pathGeometry.addChild(segment);

    }

    return pathGeometry;

};



// ALL THINGS BELOW TO BE REFACTORED
// QN: Transform final pts or transform ACTIONS or add transform filters?

// FUTURE refactor path = an array of lines -> straight, bezier, splines, arc, funcexpr lines
// Read http://www.planetclegg.com/projects/WarpingTextToSplines.html

THREE.Path.prototype.transform = function( path ) {

	path = new THREE.Path();
	path.moveTo( 0, 0 );
	path.quadraticCurveTo( 100, 20, 140, 80 );

	console.log( path.cacheArcLengths() );

	var thisBounds = this.getMinAndMax();
	var oldPts = this.getPoints();

	var i, il, p, oldX, oldY, xNorm;

	for ( i = 0, il = oldPts.length; i < il; i ++ ) {

		p = oldPts[ i ];

		oldX = p.x;
		oldY = p.y;

		var xNorm = oldX/ thisBounds.maxX;

		// If using actual distance, for length > path, requires line extrusions
		//xNorm = path.getUtoTmapping(xNorm, oldX); // 3 styles. 1) wrap stretched. 2) wrap stretch by arc length 3) warp by actual distance

		var pathPt = path.getPoint( xNorm );
		var normal = path.getNormalVector( xNorm ).multiplyScalar( oldY );

		p.x = pathPt.x + normal.x;
		p.y = pathPt.y + normal.y;

		//p.x = a * oldX + b * oldY + c;
		//p.y = d * oldY + e * oldX + f;

	}

	return oldPts;

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

	var bounds = this.getMinAndMax();

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

	//var p, points = this.getPoints();

	var theta = -90 /180 * Math.PI;
	var p, points = this.transform( 0.866, - 0.866,0, 0.500 , 0.50,-50 );

	//0.866, - 0.866,0, 0.500 , 0.50,-50

	// Math.cos(theta),Math.sin(theta),100,
	// Math.cos(theta),-Math.sin(theta),-50

	// translate, scale, rotation

	// a - horizontal size
	// b - lean
	// c - x offset
	// d - vertical size
	// e - climb
	// f - y offset
	// 1,0,0,
	// -1,0,100

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
		
		if (action==THREE.PathActions.MOVE_TO) {
			if (lastPath.actions.length!=0) {
				
				subPaths.push(lastPath);
				lastPath = new THREE.Path();
				
			}
		}
		lastPath[action].apply( lastPath, args);
		
	}
	
	if (lastPath.actions.length!=0) {	
	
		subPaths.push(lastPath);
		
	}
	
	console.log(subPaths);
	
	var holesFirst = !THREE.Shape.Utils.isClockWise(subPaths[0].getPoints());
	var tmpShape, shapes = [];
	var tmpPath;
	
	console.log("Holes first", holesFirst);
	
	if (holesFirst) {
		tmpShape = new THREE.Shape();
		for ( i=0, il = subPaths.length; i<il; i++) {
		
			tmpPath = subPaths[i];
			
			if (THREE.Shape.Utils.isClockWise(tmpPath.getPoints())) {
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;
				
				shapes.push(tmpShape);
				tmpShape = new THREE.Shape();
				
				console.log('cw', i);
				
			} else {
				tmpShape.holes.push(tmpPath);
				console.log('ccw', i);
				
			}
		
		}
	} else {
		// Shapes first
		for ( i=0, il = subPaths.length; i<il; i++) {
		
			tmpPath = subPaths[i];
			
			if (THREE.Shape.Utils.isClockWise(tmpPath.getPoints())) {
				
				
				if (tmpShape) shapes.push(tmpShape);
				tmpShape = new THREE.Shape();
				tmpShape.actions = tmpPath.actions;
				tmpShape.curves = tmpPath.curves;
				
			} else {
				tmpShape.holes.push(tmpPath);
			}
		
		}
		shapes.push(tmpShape);
	}
	
	console.log("shape", shapes);
	
	return shapes;
};