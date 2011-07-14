/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form path.
 **/

THREE.Path = function ( points ) {

	this.actions = [];

	if ( points ) {

		this.fromPoints( points );

	}

};

THREE.PathActions = {

	MOVE_TO: 'moveTo',
	LINE_TO: 'lineTo',
	QUADRATIC_CURVE_TO: 'quadraticCurveTo', // BEZIER quadratic CURVE
	BEZIER_CURVE_TO: 'bezierCurveTo', 		// BEZIER cubic CURVE
	CSPLINE_THRU: 'splineThru' 				// TODO cardinal splines

};

/* Create path using straight lines to connect all points */

THREE.Path.prototype.fromPoints = function( vectors /*Array of Vector*/ ) {

	var v = 0, vlen = vectors.length;

	this.moveTo( vectors[ 0 ].x, vectors[ 0 ].y );

	for ( v = 1; v < vlen; v++ ) {

		this.lineTo( vectors[ v ].x, vectors[ v ].y );

	};

};

THREE.Path.prototype.moveTo = function( x, y ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.MOVE_TO, args: args } );

};

THREE.Path.prototype.lineTo = function( x, y ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.LINE_TO, args: args } );

};

THREE.Path.prototype.quadraticCurveTo = function( aCPx, aCPy, aX, aY ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.QUADRATIC_CURVE_TO, args: args });

};

THREE.Path.prototype.bezierCurveTo = function( aCP1x, aCP1y,
                                               aCP2x, aCP2y,
                                               aX, aY) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.BEZIER_CURVE_TO, args: args } );

};

THREE.Path.prototype.splineThru = function( pts /*Array of Vector*/ ) {

	var args = Array.prototype.slice.call( arguments );
	this.actions.push( { action: THREE.PathActions.CSPLINE_THRU, args: args } );

}

// TODO ARC (x,y, x-radius, y-radius, startAngle, endAngle)
THREE.Path.prototype.arc = function() {
	
};

// TODO
// Create a new func eg. sin (theta) x
THREE.Path.prototype.addExprFunc = function(exprName, func) {
};
	
/* Return an array of vectors based on contour of the path */

THREE.Path.prototype.getPoints = function( divisions ) {

	divisions = divisions || 4;

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

				// TODO use LOD for divisions

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
			var spts = args[ 0 ];
			var n = divisions * spts.length;

			spts.unshift( last );

			var spline = new Spline2();

			for ( j = 0; j < n; j ++ ) {

				points.push( spline.get2DPoint( spts, j / n ) ) ;

			}

			break;

		}

	}

	return points;

};

var Spline2 = function () {

	var c = [], v2,
		point, intPoint, weight;

	this.get2DPoint = function ( points, k ) {

		v2 = new THREE.Vector2();
		point = ( points.length - 1 ) * k;

		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
		c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

		v2.x = interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
		v2.y = interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );

		//console.log('point',point, v2);

		return v2;

	}

	// Catmull-Rom

	function interpolate( p0, p1, p2, p3, t ) {

		var v0 = ( p2 - p0 ) * 0.5;
		var v1 = ( p3 - p1 ) * 0.5;
		var t2 = t * t;
		var t3 = t * t2;
		return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	}

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

	// TODO find mid-pt?

	return {

		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY

	};

};

// createPathGeometry by SolarCoordinates
/* Returns Object3D with line segments stored as children  */
THREE.Path.prototype.createPathGeometry = function(divisions, lineMaterial) {
    var pts = this.getPoints(divisions);

    var segment, pathGeometry = new THREE.Object3D;
    if(!lineMaterial) lineMaterial = new THREE.LineBasicMaterial( { color:0x000000, opacity:0.7 } );

    for(var i=1; i<pts.length; i++) {
        var pathSegment = new THREE.Geometry();
        pathSegment.vertices.push( new THREE.Vertex( new THREE.Vector3( pts[i-1].x, pts[i-1].y, 0 ) ) );
        pathSegment.vertices.push( new THREE.Vertex( new THREE.Vector3( pts[i].x, pts[i].y, 0) ) );
        segment = new THREE.Line( pathSegment , lineMaterial );
        pathGeometry.addChild(segment);
    }

    return(pathGeometry);
};


// ALL THINGS BELOW TO BE REFACTORSED
// QN: Transform final pts or transform ACTIONS or add transform filters?
THREE.Path.prototype.getPoint = function(t) {
	var x0, y0, x1, y1, x2, y2;
	x0 = this.actions[0].args[0];
	y0 = this.actions[0].args[1];
	x1 = this.actions[1].args[0];
	y1 = this.actions[1].args[1];
	x2 = this.actions[1].args[2];
	y2 = this.actions[1].args[3];
	
	var tx, ty;
	
	tx = THREE.FontUtils.b2( t, x0, x1, x2 );
	ty = THREE.FontUtils.b2( t, y0, y1, y2 );
	
	return new THREE.Vector2( tx, ty );
};

THREE.Path.prototype.getNormalVector = function(t) {
	// iterate sub segments
	// 	get lengths for sub segments
	// 	if segment is bezier
	//		perform sub devisions or perform integrals.
	var x0, y0, x1, y1, x2, y2;
	x0 = this.actions[0].args[0];
	y0 = this.actions[0].args[1];
	x1 = this.actions[1].args[0];
	y1 = this.actions[1].args[1];
	x2 = this.actions[1].args[2];
	y2 = this.actions[1].args[3];
	
	var tx, ty;
	
	tx = tangentQuad( t, x0, x1, x2 );
	ty = tangentQuad( t, y0, y1, y2 );
	
	// return normal
	
	return new THREE.Vector2( -ty , tx ).unit();
	
};

THREE.Path.prototype.cacheArcLengths = function() {
	var divisions = 200;
	var cache = [];
	var p=1;
	var last = this.getPoint(0), current;
	var sum = 0;
	for (; p <= divisions; p++) {
		current = this.getPoint (p/divisions);
		sum += current.distanceTo(last);
		cache.push(sum);
		last = current;
	}
	
	this.arcLengthCache = cache;
	return {sums: cache, sum:sum};
	
};

/* Given u (0..1), get a t to find p. This gives you pt which are equi distance */

THREE.Path.prototype.getUtoTmapping = function(u, distance) {
	
	//var arcs = this.cacheArcLengths();
	var cache = this.arcLengthCache; 
	var i = 0,il = cache.length;
	
	var distanceForU = u * cache[cache.length-1];
	if (distance) distanceForU = distance;
	
	// Should do binary search + sub division + interpolation if needed
	while (i<il) {
		if (cache[i]>distanceForU) break;
		i++;
	}
	
	var t= i/il;
	return t;
	
	
};


var tangentQuad = function (t, p0, p1, p2 ) {
	return 2 * ( 1 - t ) * ( p1 - p0 ) + 2 * t * ( p2 - p1 ) ;
}


// FUTURE refactor path = an array of lines -> straight, bezier, splines, arc, funcexpr lines
// Read http://www.planetclegg.com/projects/WarpingTextToSplines.html
THREE.Path.prototype.transform = function(path) {
	path = new THREE.Path();
	path.moveTo(0,0);
	path.quadraticCurveTo(200,20, 240,80);
	
	console.log(path.cacheArcLengths());
	
	
	var thisBounds = this.getMinAndMax();
	var oldPts = this.getPoints();
	var i, il, p, oldX, oldY, xNorm;
	for (i=0,il=oldPts.length; i< il;i++){
		p = oldPts[i];
		oldX = p.x;
		oldY = p.y;
		var xNorm = oldX/ thisBounds.maxX;
		
		xNorm = path.getUtoTmapping(xNorm, oldX); // 3 styles. 1) wrap stretched. 2) wrap stretch by arc length 3) warp by actual distance
		
		var pathPt = path.getPoint(xNorm);
		var normal = path.getNormalVector(xNorm).multiplyScalar(oldY);;
		
		p.x = pathPt.x + normal.x;
		p.y = pathPt.y + normal.y;
		
		//p.x = a * oldX + b * oldY + c;
		//p.y = d * oldY + e * oldX + f;
		
	}
	
	return oldPts;
	
};

// Read http://www.tinaja.com/glib/nonlingr.pdf
//nonlinear transforms
THREE.Path.prototype.nltransform = function(a,b,c,d,e,f) {

	var oldPts = this.getPoints();
	var i, il, p, oldX, oldY;
	for (i=0,il=oldPts.length; i< il;i++){
		p = oldPts[i];
		oldX = p.x;
		oldY = p.y;
		p.x = a * oldX + b * oldY + c;
		p.y = d * oldY + e * oldX + f;
		
	}
	return oldPts;
	
};

/* Draws this path onto a 2d canvas easily */

THREE.Path.prototype.debug = function( canvas ) {

	// JUST A STUB

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

	// DebugPoints

	ctx.strokeStyle = "red";

	//var p, points = this.getPoints();
	var theta = -90 /180 * Math.PI;
	var p, points = this.transform(0.866, - 0.866,0, 0.500 , 0.50,-50);
									
									//0.866, - 0.866,0, 0.500 , 0.50,-50
				// Math.cos(theta),Math.sin(theta),100,
				// Math.cos(theta),-Math.sin(theta),-50
// translate, scale, rotation
									// a - horiztonal size 
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
