/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows frustum, line of sight and up of the camera
 *	- suitable for fast updates
 * 	- based on frustum visualization in lightgl.js shadowmap example
 *		http://evanw.github.com/lightgl.js/tests/shadowmap.html
 */

THREE.CameraHelper = function ( camera ) {

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } );

	var pointMap = {};

	// colors

	this.colors = {
		frustum: new THREE.Color( 0xffaa00 ),
		cone: new THREE.Color( 0xff0000 ),
		up: new THREE.Color( 0x00aaff ),
		target: new THREE.Color( 0xffffff ),
		cross: new THREE.Color( 0x333333 )	
	};

	// near

	addLine( "n1", "n2", this.colors.frustum ); //0,1
	addLine( "n2", "n4", this.colors.frustum ); //2,3
	addLine( "n4", "n3", this.colors.frustum ); //4,5
	addLine( "n3", "n1", this.colors.frustum ); //6,7

	// far

	addLine( "f1", "f2", this.colors.frustum ); //8,9
	addLine( "f2", "f4", this.colors.frustum ); //10,11
	addLine( "f4", "f3", this.colors.frustum ); //12,13
	addLine( "f3", "f1", this.colors.frustum ); //14,15

	// sides

	addLine( "n1", "f1", this.colors.frustum ); //16,17
	addLine( "n2", "f2", this.colors.frustum ); //18,19
	addLine( "n3", "f3", this.colors.frustum ); //20,21
	addLine( "n4", "f4", this.colors.frustum ); //22,23

	// cone

	addLine( "p", "n1", this.colors.cone ); //24,25
	addLine( "p", "n2", this.colors.cone ); //26,27
	addLine( "p", "n3", this.colors.cone ); //28,29
	addLine( "p", "n4", this.colors.cone ); //30,31

	// up

	addLine( "u1", "u2", this.colors.up ); //32,33
	addLine( "u2", "u3", this.colors.up ); //34,35
	addLine( "u3", "u1", this.colors.up ); //36,37

	// target

	addLine( "c", "t", this.colors.target ); //38,39
	addLine( "p", "c", this.colors.cross ); //40,41

	// cross

	addLine( "cn1", "cn2", this.colors.cross ); //42,43
	addLine( "cn3", "cn4", this.colors.cross ); //44,45

	addLine( "cf1", "cf2", this.colors.cross ); //46,47
	addLine( "cf3", "cf4", this.colors.cross ); //48,49

	function addLine( a, b, hex ) {

		addPoint( a, hex );
		addPoint( b, hex );

	}

	function addPoint( id, hex ) {

		geometry.vertices.push( new THREE.Vector3() );
		geometry.colors.push( new THREE.Color( hex ) );

		if ( pointMap[ id ] === undefined ) {

			pointMap[ id ] = [];

		}

		pointMap[ id ].push( geometry.vertices.length - 1 );

	}

	THREE.Line.call( this, geometry, material, THREE.LinePieces );

	this.camera = camera;
	this.matrix = camera.matrixWorld;
	this.matrixAutoUpdate = false;

	this.pointMap = pointMap;

	this.update();

};

THREE.CameraHelper.prototype = Object.create( THREE.Line.prototype );
THREE.CameraHelper.prototype.constructor = THREE.CameraHelper;

THREE.CameraHelper.prototype.update = function () {

	var geometry, pointMap;
	
	var vector = new THREE.Vector3();
	var camera = new THREE.Camera();

	var setPoint = function ( point, x, y, z ) {

		vector.set( x, y, z ).unproject( camera );

		var points = pointMap[ point ];

		if ( points !== undefined ) {

			for ( var i = 0, il = points.length; i < il; i ++ ) {

				geometry.vertices[ points[ i ] ].copy( vector );

			}

		}

	};

	return function () {

		geometry = this.geometry;
		pointMap = this.pointMap;

		var w = 1, h = 1;

		// we need just camera projection matrix
		// world matrix must be identity

		camera.projectionMatrix.copy( this.camera.projectionMatrix );

		// center / target

		setPoint( "c", 0, 0, - 1 );
		setPoint( "t", 0, 0,  1 );

		// near

		setPoint( "n1", - w, - h, - 1 );
		setPoint( "n2",   w, - h, - 1 );
		setPoint( "n3", - w,   h, - 1 );
		setPoint( "n4",   w,   h, - 1 );

		// far

		setPoint( "f1", - w, - h, 1 );
		setPoint( "f2",   w, - h, 1 );
		setPoint( "f3", - w,   h, 1 );
		setPoint( "f4",   w,   h, 1 );

		// up

		setPoint( "u1",   w * 0.7, h * 1.1, - 1 );
		setPoint( "u2", - w * 0.7, h * 1.1, - 1 );
		setPoint( "u3",         0, h * 2,   - 1 );

		// cross

		setPoint( "cf1", - w,   0, 1 );
		setPoint( "cf2",   w,   0, 1 );
		setPoint( "cf3",   0, - h, 1 );
		setPoint( "cf4",   0,   h, 1 );

		setPoint( "cn1", - w,   0, - 1 );
		setPoint( "cn2",   w,   0, - 1 );
		setPoint( "cn3",   0, - h, - 1 );
		setPoint( "cn4",   0,   h, - 1 );

		geometry.verticesNeedUpdate = true;

	};

}();

THREE.CameraHelper.prototype.setColors = function ( frustum, cone, up, target, cross ) {

	this.colors.frustum.set( frustum );
	this.colors.cone.set( cone );
	this.colors.up.set( up );
	this.colors.target.set( target );
	this.colors.cross.set( cross );
	
	var colorObjectArray = this.geometry.colors;
	var i = 0;
	
	for ( i = 0; i < 24; i ++ ) {
		colorObjectArray[ i ].set( frustum );	
	}
	
	for ( i = 24; i < 32; i ++ ) {	
		colorObjectArray[ i ].set( cone );	
	}
	
	for ( i = 32; i < 38; i ++ ) {	
		colorObjectArray[ i ].set( up );	
	}
	
	for ( i = 38; i < 40; i ++ ) {	
		colorObjectArray[ i ].set( target );	
	}
	
	for ( i = 40; i < 50; i ++ ) {	
		colorObjectArray[ i ].set( cross );	
	}
	
	this.geometry.colorsNeedUpdate = true;
	
};
