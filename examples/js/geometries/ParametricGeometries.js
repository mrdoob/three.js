console.warn( "THREE.ParametricGeometries: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author zz85
 *
 * Experimenting of primitive geometry creation using Surface Parametric equations
 *
 */

THREE.ParametricGeometries = {

	klein: function ( v, u, target ) {

		u *= Math.PI;
		v *= 2 * Math.PI;

		u = u * 2;
		var x, y, z;
		if ( u < Math.PI ) {

			x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
			z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

		} else {

			x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
			z = - 8 * Math.sin( u );

		}

		y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

		target.set( x, y, z );

	},

	plane: function ( width, height ) {

		return function ( u, v, target ) {

			var x = u * width;
			var y = 0;
			var z = v * height;

			target.set( x, y, z );

		};

	},

	mobius: function ( u, t, target ) {

		// flat mobius strip
		// http://www.wolframalpha.com/input/?i=M%C3%B6bius+strip+parametric+equations&lk=1&a=ClashPrefs_*Surface.MoebiusStrip.SurfaceProperty.ParametricEquations-
		u = u - 0.5;
		var v = 2 * Math.PI * t;

		var x, y, z;

		var a = 2;

		x = Math.cos( v ) * ( a + u * Math.cos( v / 2 ) );
		y = Math.sin( v ) * ( a + u * Math.cos( v / 2 ) );
		z = u * Math.sin( v / 2 );

		target.set( x, y, z );

	},

	mobius3d: function ( u, t, target ) {

		// volumetric mobius strip

		u *= Math.PI;
		t *= 2 * Math.PI;

		u = u * 2;
		var phi = u / 2;
		var major = 2.25, a = 0.125, b = 0.65;

		var x, y, z;

		x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi );
		z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi );
		y = ( major + x ) * Math.sin( u );
		x = ( major + x ) * Math.cos( u );

		target.set( x, y, z );

	}

};


/*********************************************
 *
 * Parametric Replacement for TubeGeometry
 *
 *********************************************/

THREE.ParametricGeometries.TubeGeometry = function ( path, segments, radius, segmentsRadius, closed ) {

	this.path = path;
	this.segments = segments || 64;
	this.radius = radius || 1;
	this.segmentsRadius = segmentsRadius || 8;
	this.closed = closed || false;

	var scope = this, numpoints = this.segments + 1;

	var frames = path.computeFrenetFrames( segments, closed ),
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;

	// proxy internals

	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	var position = new THREE.Vector3();

	var ParametricTube = function ( u, v, target ) {

		v *= 2 * Math.PI;

		var i = u * ( numpoints - 1 );
		i = Math.floor( i );

		path.getPointAt( u, position );

		var normal = normals[ i ];
		var binormal = binormals[ i ];

		var cx = - scope.radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
		var cy = scope.radius * Math.sin( v );

		position.x += cx * normal.x + cy * binormal.x;
		position.y += cx * normal.y + cy * binormal.y;
		position.z += cx * normal.z + cy * binormal.z;

		target.copy( position );

	};

	THREE.ParametricGeometry.call( this, ParametricTube, segments, segmentsRadius );

};

THREE.ParametricGeometries.TubeGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.ParametricGeometries.TubeGeometry.prototype.constructor = THREE.ParametricGeometries.TubeGeometry;


/*********************************************
  *
  * Parametric Replacement for TorusKnotGeometry
  *
  *********************************************/
THREE.ParametricGeometries.TorusKnotGeometry = function ( radius, tube, segmentsT, segmentsR, p, q ) {

	this.radius = radius || 200;
	this.tube = tube || 40;
	this.segmentsT = segmentsT || 64;
	this.segmentsR = segmentsR || 8;
	this.p = p || 2;
	this.q = q || 3;

	function TorusKnotCurve() {

		THREE.Curve.call( this );

	}

	TorusKnotCurve.prototype = Object.create( THREE.Curve.prototype );
	TorusKnotCurve.prototype.constructor = TorusKnotCurve;

	TorusKnotCurve.prototype.getPoint = function ( t, optionalTarget ) {

		var point = optionalTarget || new THREE.Vector3();

		t *= Math.PI * 2;

		var r = 0.5;

		var x = ( 1 + r * Math.cos( q * t ) ) * Math.cos( p * t );
		var y = ( 1 + r * Math.cos( q * t ) ) * Math.sin( p * t );
		var z = r * Math.sin( q * t );

		return point.set( x, y, z ).multiplyScalar( radius );

	};

	var segments = segmentsT;
	var radiusSegments = segmentsR;
	var extrudePath = new TorusKnotCurve();

	THREE.ParametricGeometries.TubeGeometry.call( this, extrudePath, segments, tube, radiusSegments, true, false );

};

THREE.ParametricGeometries.TorusKnotGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.ParametricGeometries.TorusKnotGeometry.prototype.constructor = THREE.ParametricGeometries.TorusKnotGeometry;


/*********************************************
  *
  * Parametric Replacement for SphereGeometry
  *
  *********************************************/
THREE.ParametricGeometries.SphereGeometry = function ( size, u, v ) {

	function sphere( u, v, target ) {

		u *= Math.PI;
		v *= 2 * Math.PI;

		var x = size * Math.sin( u ) * Math.cos( v );
		var y = size * Math.sin( u ) * Math.sin( v );
		var z = size * Math.cos( u );

		target.set( x, y, z );

	}

	THREE.ParametricGeometry.call( this, sphere, u, v );

};

THREE.ParametricGeometries.SphereGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.ParametricGeometries.SphereGeometry.prototype.constructor = THREE.ParametricGeometries.SphereGeometry;


/*********************************************
  *
  * Parametric Replacement for PlaneGeometry
  *
  *********************************************/

THREE.ParametricGeometries.PlaneGeometry = function ( width, depth, segmentsWidth, segmentsDepth ) {

	function plane( u, v, target ) {

		var x = u * width;
		var y = 0;
		var z = v * depth;

		target.set( x, y, z );

	}

	THREE.ParametricGeometry.call( this, plane, segmentsWidth, segmentsDepth );

};

THREE.ParametricGeometries.PlaneGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.ParametricGeometries.PlaneGeometry.prototype.constructor = THREE.ParametricGeometries.PlaneGeometry;
