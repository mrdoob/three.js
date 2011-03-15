/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fov: <float>,
 *  aspect: <float>,
 *  near: <float>,
 *  far: <float>,
 *  target: <THREE.Object3D>,

 *  waypoints: <Array>,	// [ [x,y,z], [x,y,z] ... ]
 *  duration: <float>, 	// seconds
 
 *  createDebugPath: <bool>,
 *  createDebugDummy: <bool>,
 
 *  lookSpeed: <float>,
 *  lookVertical: <bool>,
 *  lookHorizontal: <bool>,
 *  verticalAngleMap: { srcRange: [ <float>, <float> ], dstRange: [ <float>, <float> ] }
 *  horizontalAngleMap: { srcRange: [ <float>, <float> ], dstRange: [ <float>, <float> ] }
 
 *  domElement: <HTMLElement>,
 * }
 */

THREE.PathCamera = function ( parameters ) {

	THREE.Camera.call( this, parameters.fov, parameters.aspect, parameters.near, parameters.far, parameters.target );

	this.duration = 10 * 1000; // milliseconds
	this.waypoints = [];
	
	this.debugPath = new THREE.Object3D();
	this.debugDummy = new THREE.Object3D();

	this.animationParent = new THREE.Object3D();

	this.lookSpeed = 0.005;
	this.lookVertical = true;
	this.lookHorizontal = true;
	this.verticalAngleMap   = { srcRange: [ 0, 6.28 ], dstRange: [ 0, 6.28 ] };
	this.horizontalAngleMap = { srcRange: [ 0, 6.28 ], dstRange: [ 0, 6.28 ] };

	this.domElement = document;

	if ( parameters ) {

		if ( parameters.duration !== undefined ) this.duration = parameters.duration * 1000;
		if ( parameters.waypoints !== undefined ) this.waypoints = parameters.waypoints;

		if ( parameters.createDebugPath !== undefined ) this.createDebugPath = parameters.createDebugPath;
		if ( parameters.createDebugDummy !== undefined ) this.createDebugDummy = parameters.createDebugDummy;

		if ( parameters.lookSpeed !== undefined ) this.lookSpeed = parameters.lookSpeed;
		if ( parameters.lookVertical !== undefined ) this.lookVertical = parameters.lookVertical;
		if ( parameters.lookHorizontal !== undefined ) this.lookHorizontal = parameters.lookHorizontal;
		if ( parameters.verticalAngleMap !== undefined ) this.verticalAngleMap = parameters.verticalAngleMap;
		if ( parameters.horizontalAngleMap !== undefined ) this.horizontalAngleMap = parameters.horizontalAngleMap;

		if ( parameters.domElement !== undefined ) this.domElement = parameters.domElement;

	}

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = 0;

	this.phi = 0;
	this.theta = 0;

	this.windowHalfX = window.innerWidth / 2;
	this.windowHalfY = window.innerHeight / 2;

	var PI2 = Math.PI * 2,
		PI180 = Math.PI / 180;

	// methods

	this.update = function ( parentMatrixWorld, forceUpdate, camera ) {

		var srcRange, dstRange;
		
		if( this.lookHorizontal ) this.lon += this.mouseX * this.lookSpeed;
		if( this.lookVertical )   this.lat -= this.mouseY * this.lookSpeed;

		this.lon = Math.max( 0, Math.min( 360, this.lon ) );
		this.lat = Math.max( - 85, Math.min( 85, this.lat ) );

		this.phi = ( 90 - this.lat ) * PI180;
		this.theta = this.lon * PI180;

		this.phi = normalize_angle_rad( this.phi );

		// constrain vertical look angle 
		
		srcRange = this.verticalAngleMap.srcRange;
		dstRange = this.verticalAngleMap.dstRange;
		
		this.phi = map_linear( this.phi, srcRange[ 0 ], srcRange[ 1 ], 
										 dstRange[ 0 ], dstRange[ 1 ] );

		// constrain horizontal look angle
		
		srcRange = this.horizontalAngleMap.srcRange;
		dstRange = this.horizontalAngleMap.dstRange;
		
		this.theta = map_linear( this.theta, srcRange[ 0 ], srcRange[ 1 ], 
										     dstRange[ 0 ], dstRange[ 1 ] );
		
		var targetPosition = this.target.position,
			position = this.position;

		targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		targetPosition.y = position.y + 100 * Math.cos( this.phi );
		targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		
		this.supr.update.call( this, parentMatrixWorld, forceUpdate, camera );

	};
	
	this.onMouseMove = function ( event ) {

		this.mouseX = event.clientX - this.windowHalfX;
		this.mouseY = event.clientY - this.windowHalfY;

	};
	
	// utils
	
	function normalize_angle_rad( a ) {
		
		var b = a % PI2;
		return b >= 0 ? b : b + PI2;

	};
	
	function cap( x, a, b ) {
	
		return ( x < a ) ? a : ( ( x > b ) ? b : x );

	};
	
	function map_linear( x, sa, sb, ea, eb ) {
		
		return ( x  - sa ) * ( eb - ea ) / ( sb - sa ) + ea;
		
	};


	function distance( a, b ) {
	
		var dx = a[ 0 ] - b[ 0 ],
			dy = a[ 1 ] - b[ 1 ],
			dz = a[ 2 ] - b[ 2 ];
		
		return Math.sqrt( dx * dx + dy * dy + dz * dz );

	};

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	function initAnimationPath( parent, path, name, duration ) {

		var animationData = {

		   name: name,
		   fps: 0.6,
		   length: duration,

		   hierarchy: []

		};

		var i, 
			parentAnimation, childAnimation,
			pl = path.length,
			sl = splineLength( path ),
			t = 0,
			first = 0,
			last  = pl - 1;

		parentAnimation = { parent: -1, keys: [] };
		parentAnimation.keys[ first ] = { time: 0,        pos: path[ first ], rot: [ 0, 0, 0, 1 ], scl: [ 1, 1, 1 ] };
		parentAnimation.keys[ last  ] = { time: duration, pos: path[ last ],  rot: [ 0, 0, 0, 1 ], scl: [ 1, 1, 1 ] };
		
		console.log( "path length total:", sl.total, "chunks:", sl.chunks );
		
		for ( i = 1; i < pl-1; i++ ) {

			t = duration * sl.chunks[ i ] / sl.total;
			
			//t += duration * distance( path[ i ], path[ i - 1 ] ) / sl.total;

			parentAnimation.keys[ i ] = { time: t, pos: path[ i ] };
			console.log( i, t/1000 );

		}

		animationData.hierarchy[ 0 ] = parentAnimation;

		THREE.AnimationHandler.add( animationData );
		
		return new THREE.Animation( parent, name, THREE.AnimationHandler.CATMULLROM_FORWARD, false );
		//return new THREE.Animation( parent, name, THREE.AnimationHandler.CATMULLROM, false );
		//return new THREE.Animation( parent, name, THREE.AnimationHandler.LINEAR, false );

	};

	function splineLength( points ) {

		var i, index, p, coords = [], 
			spline = new THREE.Spline(),
			n_sub = 100, 
			c = 0,
			point = 0, intPoint = 0, oldIntPoint = 0,
			chunkLengths = [ 0 ],
			totalLength = 0;

		for ( i = 0; i < points.length; i ++ ) {
			
			p = points[ i ];
			coords[ i ] = { x: p[ 0 ], y: p[ 1 ], z: p[ 2 ] };

		}

		var oldPosition = [ points[ 0 ][ 0 ], points[ 0 ][ 1 ], points[ 0 ][ 2 ] ];

		for ( i = 1; i < coords.length * n_sub; i ++ ) {

			index = i / ( coords.length * n_sub );
			position = spline.getPoint( coords, index );

			totalLength += distance( [ position.x, position.y, position.z ], oldPosition );
			oldPosition = [ position.x, position.y, position.z ];

			point = ( coords.length - 1 ) * index;
			intPoint = Math.floor( point );
			
			if ( intPoint != oldIntPoint ) {

				chunkLengths[ intPoint ] = totalLength;
				oldIntPoint = intPoint;

			}

			//console.log( intPoint, i, index, totalLength );

		}

		return { chunks: chunkLengths, total: totalLength };

	};


	function createSplineGeometryFromPoints( points, n_sub ) {
	
		var i, index, position,
			geometry = new THREE.Geometry(),
			spline = new THREE.Spline(),
			p, coords = [];
		
		for ( i = 0; i < points.length; i ++ ) {
			
			p = points[ i ];
			coords[ i ] = { x: p[ 0 ], y: p[ 1 ], z: p[ 2 ] };

		}
		
		for ( i = 0; i < coords.length * n_sub; i ++ ) {
		
			index = i / ( coords.length * n_sub );
			position = spline.getPoint( coords, index );
			
			geometry.vertices[ i ] = new THREE.Vertex( new THREE.Vector3( position.x, position.y, position.z ) );
			
		}
		
		return geometry;
	
	};

	function createWaypointGeometryFromPoints( points ) {
		
		var i, position,
			geometry = new THREE.Geometry();
		
		for ( i = 0; i < points.length; i ++ ) {
		
			position = points[ i ];
			geometry.vertices[ i ] = new THREE.Vertex( new THREE.Vector3( position.x, position.y, position.z ) );
			
		}
		
		return geometry;

	};
			
	function createPath( parent, path ) {

		var lineGeo = createSplineGeometryFromPoints( path, 10 ),
			particleGeo = createSplineGeometryFromPoints( path, 10 ),
			lineMat = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 3 } );
			lineObj = new THREE.Line( lineGeo, lineMat );
			particleObj = new THREE.ParticleSystem( particleGeo, new THREE.ParticleBasicMaterial( { color: 0xffaa00, size: 3 } ) );
			
		lineObj.scale.set( 1, 1, 1 );
		parent.addChild( lineObj );

		particleObj.scale.set( 1, 1, 1 );
		parent.addChild( particleObj );
			
		var waypoint,
			geo = new Sphere( 1, 16, 8 ),
			mat = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		
		for( i = 0; i < path.length; i++ ) {
			
			waypoint = new THREE.Mesh( geo, mat );
			waypoint.position.set( path[ i ][ 0 ], path[ i ][ 1 ], path[ i ][ 2 ] );
			waypoint.updateMatrix();
			parent.addChild( waypoint );
			
		}

	};

	if ( this.createDebugDummy ) {

		var dummyParentMaterial = new THREE.MeshLambertMaterial( { color: 0x0077ff } ),
		dummyChildMaterial  = new THREE.MeshLambertMaterial( { color: 0x00ff00 } ),
		dummyParentGeo = new Cube( 10, 10, 20 ),
		dummyChildGeo  = new Cube( 2, 2, 10 );

		this.animationParent = new THREE.Mesh( dummyParentGeo, dummyParentMaterial );

		var dummyChild = new THREE.Mesh( dummyChildGeo, dummyChildMaterial );
		dummyChild.position.set( 0, 10, 0 );
		
		this.animation = initAnimationPath( this.animationParent, this.waypoints, "cameraPath01", this.duration );

		this.animationParent.addChild( this );
		this.animationParent.addChild( dummyChild );
		
	} else {

		this.animation = initAnimationPath( this.animationParent, this.waypoints, "cameraPath01", this.duration );
		
		this.animationParent.addChild( this );

	}


	if ( this.createDebugPath ) {
		
		createPath( this.debugPath, this.waypoints );

	}
	
	
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );	
	
};

THREE.PathCamera.prototype = new THREE.Camera();
THREE.PathCamera.prototype.constructor = THREE.PathCamera;
THREE.PathCamera.prototype.supr = THREE.Camera.prototype;
