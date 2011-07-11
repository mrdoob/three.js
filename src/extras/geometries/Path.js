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
	CSPLINE_TO: 'cSplineTo' 				// TODO cardinal splines

};

/* Create path using straight lines to connect all points */

THREE.Path.prototype.fromPoints = function( vectors ) {

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

		}

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

	// TODO find mid-pt?

	return {

		minX: minX,
		minY: minY,
		maxX: maxX,
		maxY: maxY

	};

};

/* Draws this path onto a 2d canvas easily */

THREE.Path.prototype.debug = function( canvas ) {

	// JUST A STUB

	if ( !canvas ) {

		canvas = document.createElement( "canvas" );

		canvas.setAttribute( 'width',  200 );
		canvas.setAttribute( 'height', 200 );

		document.body.appendChild( canvas );

	}

	var ctx = canvas.getContext( "2d" );
	ctx.fillStyle = "white";
	ctx.fillRect( 0, 0, 200, 200 );

	ctx.strokeStyle = "black";
	ctx.beginPath();

	var i, il, item, action, args;

	// Debug Path

	for ( i = 0, il = this.actions.length; i < il; i ++ ) {

		item = this.actions[ i ];

		args = item.args;
		action = item.action;

		// Short hand for now

		ctx[ action ].apply( ctx, args );

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

	var p, points = this.getPoints();

	for ( i = 0, il = points.length; i < il; i ++ ) {

		p = points[ i ];

		ctx.beginPath();
		ctx.arc( p.x, p.y, 1.5, 0, Math.PI * 2, false );
		ctx.stroke();
		ctx.closePath();

	}

};
