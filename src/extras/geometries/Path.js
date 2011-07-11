/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form path.
 **/

THREE.Path = function (points) {
	this.path = [];
	if (points) {
		this.fromPoints(points);
	}
};

var ACTIONS = {
	MOVE_TO: 'moveTo',
	LINE_TO: 'lineTo',
	QUADRATIC_CURVE_TO: 'quadraticCurveTo', //BEZIER quadratic CURVE
	BEZIER_CURVE_TO: 'bezierCurveTo', //BEZIER cubic CURVE
	CSPLINE_TO: 'cSplineTo' // TODO cardinal splines
};

/* create path using straight lines to connect all points */
THREE.Path.prototype.fromPoints = function(vectors) {
	var v = 0, vlen = vectors.length;
	this.moveTo(vectors[0].x, vectors[0].y);
	for (v=1; v<vlen ;v++) {
		this.lineTo(vectors[v].x, vectors[v].y);
	};
};

THREE.Path.prototype.moveTo = function(x,y) {
	var args = Array.prototype.slice.call(arguments);
	this.path.push({action:ACTIONS.MOVE_TO, args:args});
};

THREE.Path.prototype.lineTo = function(x,y) {
	var args = Array.prototype.slice.call(arguments);
	this.path.push({action:ACTIONS.LINE_TO, args:args});
};

THREE.Path.prototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
	var args = Array.prototype.slice.call(arguments);
	this.path.push({action:ACTIONS.QUADRATIC_CURVE_TO, args:args});
};

THREE.Path.prototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
	var args = Array.prototype.slice.call(arguments);
	this.path.push({action:ACTIONS.BEZIER_CURVE_TO, args:args});
};

/* Return an array of vectors based on contour of the path */
THREE.Path.prototype.getPoints = function(divisions) {
	divisions = divisions || 12;
	var pts = [];

	var x,o, args;
	for (x in this.path) {
		o = this.path[x];
		args = o.args;
		
		switch( action = o.action ) {

		case ACTIONS.MOVE_TO:
			//pts.push( new THREE.Vector2( args[0], args[1] ) );
			break;

		case ACTIONS.LINE_TO:
			pts.push( new THREE.Vector2( args[0], args[1] ) );
			break;
			
		case ACTIONS.QUADRATIC_CURVE_TO:
			var cpx, cpy, cpx1, cpy1, cpx0, cpy0;
			cpx  = args[2];
			cpy  = args[3];
			cpx1 = args[0];
			cpy1 = args[1];
	  
			var laste, cpx0, cpy0;
			if (pts.length > 0 ) {
				laste = pts[ pts.length - 1 ];
				cpx0 = laste.x;
				cpy0 = laste.y;
			} else {
				laste = this.path[x-1].args;
				cpx0 = laste[laste.length-2];
				cpy0 = laste[laste.length-1];
			}
			
			for ( i2 = 1; i2 <= divisions; i2++ ) {
				// TODO use LOD for divions
				var t = i2 / divisions;
				var tx = THREE.FontUtils.b2( t, cpx0, cpx1, cpx );
				var ty = THREE.FontUtils.b2( t, cpy0, cpy1, cpy );
				pts.push( new THREE.Vector2( tx, ty ) );

		  	}

		               
	  
		  break;

		case ACTIONS.BEZIER_CURVE_TO:
			cpx  = args[4];
			cpy  = args[5];
			
			cpx1 = args[0];
			cpy1 = args[1];
			
			cpx2 = args[2];
			cpy2 = args[3];
	  		
			var laste, cpx0, cpy0;
			if (pts.length > 0 ) {
				laste = pts[ pts.length - 1 ];
				cpx0 = laste.x;
				cpy0 = laste.y;
			} else {
				laste = this.path[x-1].args;
				cpx0 = laste[laste.length-2];
				cpy0 = laste[laste.length-1];
			}
			
		
			for ( i2 = 1; i2 <= divisions; i2++ ) {

				var t = i2 / divisions;
				var tx = THREE.FontUtils.b3( t, cpx0, cpx1, cpx2, cpx );
				var ty = THREE.FontUtils.b3( t, cpy0, cpy1, cpy2, cpy );
				pts.push( new THREE.Vector2( tx, ty ) );

			}

			
			break;

		}
		
	}
	
	return pts;
	
};


THREE.Path.prototype.getMinAndMax = function() {
	var pts = this.getPoints();
	var maxX = maxY = Number.NEGATIVE_INFINITY;
	var minX = minY = Number.POSITIVE_INFINITY;
	var p, pt;
	for (p in pts) {
		pt = pts[p];
		if (pt.x > maxX) maxX = pt.x;
		if (pt.y > maxY) maxY = pt.y;
		if (pt.x < minX) minX = pt.x;
		if (pt.y < maxY) minY = pt.y;
		
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
THREE.Path.prototype.debug = function(canvas) {
	// JUST A STUB
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.setAttribute('width', 200);
		canvas.setAttribute('height', 200);
		document.body.appendChild(canvas);
		
	}
	
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,200,200);

	ctx.strokeStyle = "black";
	ctx.beginPath();
	
	
	var i,o, a;
	
	// Debug Path
	for (i in this.path) {
		o = this.path[i];
		a = o.args;
		
		// Short hand for now
		ctx[o.action].apply(ctx, a);
		
		/*
		switch (o.action) {
			case ACTIONS.MOVE_TO:
				ctx[o.action](a[0],a[1]);
				break;
			case ACTIONS.LINE_TO:
				ctx[o.action](a[0],a[1]);
				break;
			case ACTIONS.QUADRATIC_CURVE_TO:
				ctx[o.action](a[0],a[1],a[2],a[3]);
				break;
			case ACTIONS.CUBIC_CURVE_TO: 
				ctx[o.action](a[0],a[1],a[2],a[3], a[4], a[5]);
				break;
		}*/
		
	
	}
	ctx.stroke();
	ctx.closePath();
	
	
	
	
	// DebugPoints
	ctx.strokeStyle = "red";
	var pts = this.getPoints();
	
	for (var p in pts) {
		ctx.beginPath();
		ctx.arc(pts[p].x,pts[p].y, 1.5,0, Math.PI*2, false);
		ctx.stroke();
		ctx.closePath();
	}
	
	
	
};

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 Extrude Geometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to Vertics
// STEP 3b - Triangulate Each Shape

/* Defines a 2d shape plane using paths */

THREE.Shape = function ( ) {

	THREE.Path.apply( this, arguments);
	this.holes = [];

};

THREE.Shape.prototype = new THREE.Path();

THREE.Shape.prototype.constructor = THREE.Path;

/* Returns vertices of triangulated faces | get faces */
THREE.Shape.prototype.triangulate = function() {
	return THREE.FontUtils.Triangulate( this.getPoints(), true );
};

/* Convienence Method to return ExtrudeGeometry */
THREE.Shape.prototype.extrude = function(options) {
	var extruded =  new THREE.ExtrudeGeometry(this, options);
	return extruded; 
};

THREE.ExtrudeGeometry = function(shape, options) {
	var amount;
    if (!options.amount) {
		amount = 100; 
	} else {
		amount = options.amount;
	}
  
    
	THREE.Geometry.call( this );
    
    vertices = shape.getPoints();
    faces = shape.triangulate();
    contour = vertices;
	bezelEnabled = false; 

    var scope = this;

	var i, 
			vert, vlen = vertices.length, 
			face, flen = faces.length;

	// Back facing vertices
	
	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, 0 );

	}

	// Front facing vertices

	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, amount );

	}

	if ( bezelEnabled ) {

		for ( i = 0; i < blen; i++ ) {

			bezelPt = bezelPoints[ i ];
			v( bezelPt.x, bezelPt.y, bezelThickness );

		}

		for ( i = 0; i < blen; i++ ) {

			bezelPt = bezelPoints[ i ];
			v( bezelPt.x, bezelPt.y, amount - bezelThickness );

		}

	}

	// Bottom faces

	for ( i = 0; i < flen; i++ ) {

		face = faces[ i ];
		f3( face[ 2 ], face[ 1 ], face[ 0 ] );

	}

	// Top faces

	for ( i = 0; i < flen; i++ ) {

		face = faces[ i ];
		f3( face[ 0 ] + vlen, face[ 1 ] + vlen, face[ 2 ] + vlen );

	}

	var lastV;
	var j, k, l, m;


	// Faces Sides  

	contour.push(contour[0]); // in order not to check for boundary indics every time.	
	
	i = contour.length;

	while ( --i > 0 ) {

		lastV = contour[ i ];

		for ( j = 0; j < vlen; j++ ) {

			if ( vertices[ j ].equals( contour[ i ] ) ) break;

		}
		
		for ( k = 0; k < vlen; k++ ) {

			if ( vertices[ k ].equals( contour[ i - 1 ] ) ) break;

		}

		// Create faces for the z-sides of the text

		f4( j, k, k + vlen, j + vlen );

	}


	// UVs to be added

	this.computeCentroids();
	this.computeFaceNormals();
	//this.computeVertexNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f3( a, b, c ) {

		scope.faces.push( new THREE.Face3( a, b, c) );

	}

	function f4( a, b, c, d ) {

		scope.faces.push( new THREE.Face4( a, b, c, d) );

	}


};



THREE.ExtrudeGeometry.prototype = new THREE.Geometry();
THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry;
