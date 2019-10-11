/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
	BufferAttribute,
	BufferGeometry,
	Quaternion,
	Raycaster,
	Vector3
} from "../../../build/three.module.js";

var RollerCoasterGeometry = function ( curve, divisions ) {

	BufferGeometry.call( this );

	var vertices = [];
	var normals = [];
	var colors = [];

	var color1 = [ 1, 1, 1 ];
	var color2 = [ 1, 1, 0 ];

	var up = new Vector3( 0, 1, 0 );
	var forward = new Vector3();
	var right = new Vector3();

	var quaternion = new Quaternion();
	var prevQuaternion = new Quaternion();
	prevQuaternion.setFromAxisAngle( up, Math.PI / 2 );

	var point = new Vector3();
	var prevPoint = new Vector3();
	prevPoint.copy( curve.getPointAt( 0 ) );

	// shapes

	var step = [
		new Vector3( - 0.225, 0, 0 ),
		new Vector3( 0, - 0.050, 0 ),
		new Vector3( 0, - 0.175, 0 ),

		new Vector3( 0, - 0.050, 0 ),
		new Vector3( 0.225, 0, 0 ),
		new Vector3( 0, - 0.175, 0 )
	];

	var PI2 = Math.PI * 2;

	var sides = 5;
	var tube1 = [];

	for ( var i = 0; i < sides; i ++ ) {

		var angle = ( i / sides ) * PI2;
		tube1.push( new Vector3( Math.sin( angle ) * 0.06, Math.cos( angle ) * 0.06, 0 ) );

	}

	var sides = 6;
	var tube2 = [];

	for ( var i = 0; i < sides; i ++ ) {

		var angle = ( i / sides ) * PI2;
		tube2.push( new Vector3( Math.sin( angle ) * 0.025, Math.cos( angle ) * 0.025, 0 ) );

	}

	var vector = new Vector3();
	var normal = new Vector3();

	function drawShape( shape, color ) {

		normal.set( 0, 0, - 1 ).applyQuaternion( quaternion );

		for ( var j = 0; j < shape.length; j ++ ) {

			vector.copy( shape[ j ] );
			vector.applyQuaternion( quaternion );
			vector.add( point );

			vertices.push( vector.x, vector.y, vector.z );
			normals.push( normal.x, normal.y, normal.z );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

		}

		normal.set( 0, 0, 1 ).applyQuaternion( quaternion );

		for ( var j = shape.length - 1; j >= 0; j -- ) {

			vector.copy( shape[ j ] );
			vector.applyQuaternion( quaternion );
			vector.add( point );

			vertices.push( vector.x, vector.y, vector.z );
			normals.push( normal.x, normal.y, normal.z );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

		}

	}

	var vector1 = new Vector3();
	var vector2 = new Vector3();
	var vector3 = new Vector3();
	var vector4 = new Vector3();

	var normal1 = new Vector3();
	var normal2 = new Vector3();
	var normal3 = new Vector3();
	var normal4 = new Vector3();

	function extrudeShape( shape, offset, color ) {

		for ( var j = 0, jl = shape.length; j < jl; j ++ ) {

			var point1 = shape[ j ];
			var point2 = shape[ ( j + 1 ) % jl ];

			vector1.copy( point1 ).add( offset );
			vector1.applyQuaternion( quaternion );
			vector1.add( point );

			vector2.copy( point2 ).add( offset );
			vector2.applyQuaternion( quaternion );
			vector2.add( point );

			vector3.copy( point2 ).add( offset );
			vector3.applyQuaternion( prevQuaternion );
			vector3.add( prevPoint );

			vector4.copy( point1 ).add( offset );
			vector4.applyQuaternion( prevQuaternion );
			vector4.add( prevPoint );

			vertices.push( vector1.x, vector1.y, vector1.z );
			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector3.x, vector3.y, vector3.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			//

			normal1.copy( point1 );
			normal1.applyQuaternion( quaternion );
			normal1.normalize();

			normal2.copy( point2 );
			normal2.applyQuaternion( quaternion );
			normal2.normalize();

			normal3.copy( point2 );
			normal3.applyQuaternion( prevQuaternion );
			normal3.normalize();

			normal4.copy( point1 );
			normal4.applyQuaternion( prevQuaternion );
			normal4.normalize();

			normals.push( normal1.x, normal1.y, normal1.z );
			normals.push( normal2.x, normal2.y, normal2.z );
			normals.push( normal4.x, normal4.y, normal4.z );

			normals.push( normal2.x, normal2.y, normal2.z );
			normals.push( normal3.x, normal3.y, normal3.z );
			normals.push( normal4.x, normal4.y, normal4.z );

			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );
			colors.push( color[ 0 ], color[ 1 ], color[ 2 ] );

		}

	}

	var offset = new Vector3();

	for ( var i = 1; i <= divisions; i ++ ) {

		point.copy( curve.getPointAt( i / divisions ) );

		up.set( 0, 1, 0 );

		forward.subVectors( point, prevPoint ).normalize();
		right.crossVectors( up, forward ).normalize();
		up.crossVectors( forward, right );

		var angle = Math.atan2( forward.x, forward.z );

		quaternion.setFromAxisAngle( up, angle );

		if ( i % 2 === 0 ) {

			drawShape( step, color2 );

		}

		extrudeShape( tube1, offset.set( 0, - 0.125, 0 ), color2 );
		extrudeShape( tube2, offset.set( 0.2, 0, 0 ), color1 );
		extrudeShape( tube2, offset.set( - 0.2, 0, 0 ), color1 );

		prevPoint.copy( point );
		prevQuaternion.copy( quaternion );

	}

	// console.log( vertices.length );

	this.addAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
	this.addAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );
	this.addAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 3 ) );

};

RollerCoasterGeometry.prototype = Object.create( BufferGeometry.prototype );

var RollerCoasterLiftersGeometry = function ( curve, divisions ) {

	BufferGeometry.call( this );

	var vertices = [];
	var normals = [];

	var quaternion = new Quaternion();

	var up = new Vector3( 0, 1, 0 );

	var point = new Vector3();
	var tangent = new Vector3();

	// shapes

	var tube1 = [
		new Vector3( 0, 0.05, - 0.05 ),
		new Vector3( 0, 0.05, 0.05 ),
		new Vector3( 0, - 0.05, 0 )
	];

	var tube2 = [
		new Vector3( - 0.05, 0, 0.05 ),
		new Vector3( - 0.05, 0, - 0.05 ),
		new Vector3( 0.05, 0, 0 )
	];

	var tube3 = [
		new Vector3( 0.05, 0, - 0.05 ),
		new Vector3( 0.05, 0, 0.05 ),
		new Vector3( - 0.05, 0, 0 )
	];

	var vector1 = new Vector3();
	var vector2 = new Vector3();
	var vector3 = new Vector3();
	var vector4 = new Vector3();

	var normal1 = new Vector3();
	var normal2 = new Vector3();
	var normal3 = new Vector3();
	var normal4 = new Vector3();

	function extrudeShape( shape, fromPoint, toPoint ) {

		for ( var j = 0, jl = shape.length; j < jl; j ++ ) {

			var point1 = shape[ j ];
			var point2 = shape[ ( j + 1 ) % jl ];

			vector1.copy( point1 );
			vector1.applyQuaternion( quaternion );
			vector1.add( fromPoint );

			vector2.copy( point2 );
			vector2.applyQuaternion( quaternion );
			vector2.add( fromPoint );

			vector3.copy( point2 );
			vector3.applyQuaternion( quaternion );
			vector3.add( toPoint );

			vector4.copy( point1 );
			vector4.applyQuaternion( quaternion );
			vector4.add( toPoint );

			vertices.push( vector1.x, vector1.y, vector1.z );
			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			vertices.push( vector2.x, vector2.y, vector2.z );
			vertices.push( vector3.x, vector3.y, vector3.z );
			vertices.push( vector4.x, vector4.y, vector4.z );

			//

			normal1.copy( point1 );
			normal1.applyQuaternion( quaternion );
			normal1.normalize();

			normal2.copy( point2 );
			normal2.applyQuaternion( quaternion );
			normal2.normalize();

			normal3.copy( point2 );
			normal3.applyQuaternion( quaternion );
			normal3.normalize();

			normal4.copy( point1 );
			normal4.applyQuaternion( quaternion );
			normal4.normalize();

			normals.push( normal1.x, normal1.y, normal1.z );
			normals.push( normal2.x, normal2.y, normal2.z );
			normals.push( normal4.x, normal4.y, normal4.z );

			normals.push( normal2.x, normal2.y, normal2.z );
			normals.push( normal3.x, normal3.y, normal3.z );
			normals.push( normal4.x, normal4.y, normal4.z );

		}

	}

	var fromPoint = new Vector3();
	var toPoint = new Vector3();

	for ( var i = 1; i <= divisions; i ++ ) {

		point.copy( curve.getPointAt( i / divisions ) );
		tangent.copy( curve.getTangentAt( i / divisions ) );

		var angle = Math.atan2( tangent.x, tangent.z );

		quaternion.setFromAxisAngle( up, angle );

		//

		if ( point.y > 10 ) {

			fromPoint.set( - 0.75, - 0.35, 0 );
			fromPoint.applyQuaternion( quaternion );
			fromPoint.add( point );

			toPoint.set( 0.75, - 0.35, 0 );
			toPoint.applyQuaternion( quaternion );
			toPoint.add( point );

			extrudeShape( tube1, fromPoint, toPoint );

			fromPoint.set( - 0.7, - 0.3, 0 );
			fromPoint.applyQuaternion( quaternion );
			fromPoint.add( point );

			toPoint.set( - 0.7, - point.y, 0 );
			toPoint.applyQuaternion( quaternion );
			toPoint.add( point );

			extrudeShape( tube2, fromPoint, toPoint );

			fromPoint.set( 0.7, - 0.3, 0 );
			fromPoint.applyQuaternion( quaternion );
			fromPoint.add( point );

			toPoint.set( 0.7, - point.y, 0 );
			toPoint.applyQuaternion( quaternion );
			toPoint.add( point );

			extrudeShape( tube3, fromPoint, toPoint );

		} else {

			fromPoint.set( 0, - 0.2, 0 );
			fromPoint.applyQuaternion( quaternion );
			fromPoint.add( point );

			toPoint.set( 0, - point.y, 0 );
			toPoint.applyQuaternion( quaternion );
			toPoint.add( point );

			extrudeShape( tube3, fromPoint, toPoint );

		}

	}

	this.addAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
	this.addAttribute( 'normal', new BufferAttribute( new Float32Array( normals ), 3 ) );

};

RollerCoasterLiftersGeometry.prototype = Object.create( BufferGeometry.prototype );

var RollerCoasterShadowGeometry = function ( curve, divisions ) {

	BufferGeometry.call( this );

	var vertices = [];

	var up = new Vector3( 0, 1, 0 );
	var forward = new Vector3();

	var quaternion = new Quaternion();
	var prevQuaternion = new Quaternion();
	prevQuaternion.setFromAxisAngle( up, Math.PI / 2 );

	var point = new Vector3();

	var prevPoint = new Vector3();
	prevPoint.copy( curve.getPointAt( 0 ) );
	prevPoint.y = 0;

	var vector1 = new Vector3();
	var vector2 = new Vector3();
	var vector3 = new Vector3();
	var vector4 = new Vector3();

	for ( var i = 1; i <= divisions; i ++ ) {

		point.copy( curve.getPointAt( i / divisions ) );
		point.y = 0;

		forward.subVectors( point, prevPoint );

		var angle = Math.atan2( forward.x, forward.z );

		quaternion.setFromAxisAngle( up, angle );

		vector1.set( - 0.3, 0, 0 );
		vector1.applyQuaternion( quaternion );
		vector1.add( point );

		vector2.set( 0.3, 0, 0 );
		vector2.applyQuaternion( quaternion );
		vector2.add( point );

		vector3.set( 0.3, 0, 0 );
		vector3.applyQuaternion( prevQuaternion );
		vector3.add( prevPoint );

		vector4.set( - 0.3, 0, 0 );
		vector4.applyQuaternion( prevQuaternion );
		vector4.add( prevPoint );

		vertices.push( vector1.x, vector1.y, vector1.z );
		vertices.push( vector2.x, vector2.y, vector2.z );
		vertices.push( vector4.x, vector4.y, vector4.z );

		vertices.push( vector2.x, vector2.y, vector2.z );
		vertices.push( vector3.x, vector3.y, vector3.z );
		vertices.push( vector4.x, vector4.y, vector4.z );

		prevPoint.copy( point );
		prevQuaternion.copy( quaternion );

	}

	this.addAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

};

RollerCoasterShadowGeometry.prototype = Object.create( BufferGeometry.prototype );

var SkyGeometry = function () {

	BufferGeometry.call( this );

	var vertices = [];

	for ( var i = 0; i < 100; i ++ ) {

		var x = Math.random() * 800 - 400;
		var y = Math.random() * 50 + 50;
		var z = Math.random() * 800 - 400;

		var size = Math.random() * 40 + 20;

		vertices.push( x - size, y, z - size );
		vertices.push( x + size, y, z - size );
		vertices.push( x - size, y, z + size );

		vertices.push( x + size, y, z - size );
		vertices.push( x + size, y, z + size );
		vertices.push( x - size, y, z + size );

	}


	this.addAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );

};

SkyGeometry.prototype = Object.create( BufferGeometry.prototype );

var TreesGeometry = function ( landscape ) {

	BufferGeometry.call( this );

	var vertices = [];
	var colors = [];

	var raycaster = new Raycaster();
	raycaster.ray.direction.set( 0, - 1, 0 );

	for ( var i = 0; i < 2000; i ++ ) {

		var x = Math.random() * 500 - 250;
		var z = Math.random() * 500 - 250;

		raycaster.ray.origin.set( x, 50, z );

		var intersections = raycaster.intersectObject( landscape );

		if ( intersections.length === 0 ) continue;

		var y = intersections[ 0 ].point.y;

		var height = Math.random() * 5 + 0.5;

		var angle = Math.random() * Math.PI * 2;

		vertices.push( x + Math.sin( angle ), y, z + Math.cos( angle ) );
		vertices.push( x, y + height, z );
		vertices.push( x + Math.sin( angle + Math.PI ), y, z + Math.cos( angle + Math.PI ) );

		angle += Math.PI / 2;

		vertices.push( x + Math.sin( angle ), y, z + Math.cos( angle ) );
		vertices.push( x, y + height, z );
		vertices.push( x + Math.sin( angle + Math.PI ), y, z + Math.cos( angle + Math.PI ) );

		var random = Math.random() * 0.1;

		for ( var j = 0; j < 6; j ++ ) {

			colors.push( 0.2 + random, 0.4 + random, 0 );

		}

	}

	this.addAttribute( 'position', new BufferAttribute( new Float32Array( vertices ), 3 ) );
	this.addAttribute( 'color', new BufferAttribute( new Float32Array( colors ), 3 ) );

};

TreesGeometry.prototype = Object.create( BufferGeometry.prototype );

export { RollerCoasterGeometry, RollerCoasterLiftersGeometry, RollerCoasterShadowGeometry, SkyGeometry, TreesGeometry };
