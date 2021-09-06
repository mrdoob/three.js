/* global QUnit */

import { Vector3 } from '../../../../src/math/Vector3';
import { Vector4 } from '../../../../src/math/Vector4';
import { Matrix3 } from '../../../../src/math/Matrix3';
import { Matrix4 } from '../../../../src/math/Matrix4';
import { Spherical } from '../../../../src/math/Spherical';
import { Quaternion } from '../../../../src/math/Quaternion';
import { Euler } from '../../../../src/math/Euler';
import { Cylindrical } from '../../../../src/math/Cylindrical';
import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera';
import {
	x,
	y,
	z,
	w,
	eps
} from './Constants.tests';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector3', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Vector3();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );

			var a = new Vector3( x, y, z );
			assert.ok( a.x === x, "Passed!" );
			assert.ok( a.y === y, "Passed!" );
			assert.ok( a.z === z, "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isVector3", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "set", ( assert ) => {

			var a = new Vector3();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );

			a.set( x, y, z );
			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z == z, "Passed!" );

		} );

		QUnit.todo( "setScalar", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setX", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setY", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setZ", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setComponent", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getComponent", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "clone", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3().copy( a );
			assert.ok( b.x == x, "Passed!" );
			assert.ok( b.y == y, "Passed!" );
			assert.ok( b.z == z, "Passed!" );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = - 2;
			assert.ok( b.x == x, "Passed!" );
			assert.ok( b.y == y, "Passed!" );
			assert.ok( b.z == z, "Passed!" );

		} );

		QUnit.test( "add", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( - x, - y, - z );

			a.add( b );
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );

			var c = new Vector3().addVectors( b, b );
			assert.ok( c.x == - 2 * x, "Passed!" );
			assert.ok( c.y == - 2 * y, "Passed!" );
			assert.ok( c.z == - 2 * z, "Passed!" );

		} );

		QUnit.todo( "addScalar", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "addVectors", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "addScaledVector", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( 2, 3, 4 );
			var s = 3;

			a.addScaledVector( b, s );
			assert.strictEqual( a.x, x + b.x * s, "Check x" );
			assert.strictEqual( a.y, y + b.y * s, "Check y" );
			assert.strictEqual( a.z, z + b.z * s, "Check z" );

		} );

		QUnit.test( "sub", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( - x, - y, - z );

			a.sub( b );
			assert.ok( a.x == 2 * x, "Passed!" );
			assert.ok( a.y == 2 * y, "Passed!" );
			assert.ok( a.z == 2 * z, "Passed!" );

			var c = new Vector3().subVectors( a, a );
			assert.ok( c.x == 0, "Passed!" );
			assert.ok( c.y == 0, "Passed!" );
			assert.ok( c.z == 0, "Passed!" );

		} );

		QUnit.todo( "subScalar", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "subVectors", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "multiply", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "multiplyScalar", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "multiplyVectors", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( 2, 3, - 5 );

			var c = new Vector3().multiplyVectors( a, b );
			assert.strictEqual( c.x, x * 2, "Check x" );
			assert.strictEqual( c.y, y * 3, "Check y" );
			assert.strictEqual( c.z, z * - 5, "Check z" );

		} );

		QUnit.test( "applyEuler", ( assert ) => {

			var a = new Vector3( x, y, z );
			var euler = new Euler( 90, - 45, 0 );
			var expected = new Vector3( - 2.352970120501014, - 4.7441750936226645, 0.9779234597246458 );

			a.applyEuler( euler );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );

		} );

		QUnit.test( "applyAxisAngle", ( assert ) => {

			var a = new Vector3( x, y, z );
			var axis = new Vector3( 0, 1, 0 );
			var angle = Math.PI / 4.0;
			var expected = new Vector3( 3 * Math.sqrt( 2 ), 3, Math.sqrt( 2 ) );

			a.applyAxisAngle( axis, angle );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );

		} );

		QUnit.test( "applyMatrix3", ( assert ) => {

			var a = new Vector3( x, y, z );
			var m = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );

			a.applyMatrix3( m );
			assert.strictEqual( a.x, 33, "Check x" );
			assert.strictEqual( a.y, 99, "Check y" );
			assert.strictEqual( a.z, 183, "Check z" );

		} );

		QUnit.test( "applyMatrix4", ( assert ) => {


			var a = new Vector3( x, y, z );
			var b = new Vector4( x, y, z, 1 );

			var m = new Matrix4().makeRotationX( Math.PI );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, "Passed!" );
			assert.ok( a.y == b.y / b.w, "Passed!" );
			assert.ok( a.z == b.z / b.w, "Passed!" );

			var m = new Matrix4().makeTranslation( 3, 2, 1 );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, "Passed!" );
			assert.ok( a.y == b.y / b.w, "Passed!" );
			assert.ok( a.z == b.z / b.w, "Passed!" );

			var m = new Matrix4().set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 1, 0
			);
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, "Passed!" );
			assert.ok( a.y == b.y / b.w, "Passed!" );
			assert.ok( a.z == b.z / b.w, "Passed!" );

		} );

		QUnit.test( "applyQuaternion", ( assert ) => {

			var a = new Vector3( x, y, z );

			a.applyQuaternion( new Quaternion() );
			assert.strictEqual( a.x, x, "Identity rotation: check x" );
			assert.strictEqual( a.y, y, "Identity rotation: check y" );
			assert.strictEqual( a.z, z, "Identity rotation: check z" );

			a.applyQuaternion( new Quaternion( x, y, z, w ) );
			assert.strictEqual( a.x, 108, "Normal rotation: check x" );
			assert.strictEqual( a.y, 162, "Normal rotation: check y" );
			assert.strictEqual( a.z, 216, "Normal rotation: check z" );

		} );

		QUnit.todo( "project", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "unproject", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "transformDirection", ( assert ) => {

			var a = new Vector3( x, y, z );
			var m = new Matrix4();
			var transformed = new Vector3( 0.3713906763541037, 0.5570860145311556, 0.7427813527082074 );

			a.transformDirection( m );
			assert.ok( Math.abs( a.x - transformed.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - transformed.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - transformed.z ) <= eps, "Check z" );

		} );

		QUnit.todo( "divide", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "divideScalar", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "min", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "max", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "clamp", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "clampScalar", ( assert ) => {

			var a = new Vector3( - 0.01, 0.5, 1.5 );
			var clamped = new Vector3( 0.1, 0.5, 1.0 );

			a.clampScalar( 0.1, 1.0 );
			assert.ok( Math.abs( a.x - clamped.x ) <= 0.001, "Check x" );
			assert.ok( Math.abs( a.y - clamped.y ) <= 0.001, "Check y" );
			assert.ok( Math.abs( a.z - clamped.z ) <= 0.001, "Check z" );

		} );

		QUnit.todo( "clampLength", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "floor", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "ceil", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "round", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "roundToZero", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "negate", ( assert ) => {

			var a = new Vector3( x, y, z );

			a.negate();
			assert.ok( a.x == - x, "Passed!" );
			assert.ok( a.y == - y, "Passed!" );
			assert.ok( a.z == - z, "Passed!" );

		} );

		QUnit.test( "dot", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( - x, - y, - z );
			var c = new Vector3();

			var result = a.dot( b );
			assert.ok( result == ( - x * x - y * y - z * z ), "Passed!" );

			var result = a.dot( c );
			assert.ok( result == 0, "Passed!" );

		} );

		QUnit.todo( "lengthSq", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "length", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "manhattanLength", ( assert ) => {

			var a = new Vector3( x, 0, 0 );
			var b = new Vector3( 0, - y, 0 );
			var c = new Vector3( 0, 0, z );
			var d = new Vector3();

			assert.ok( a.manhattanLength() == x, "Positive x" );
			assert.ok( b.manhattanLength() == y, "Negative y" );
			assert.ok( c.manhattanLength() == z, "Positive z" );
			assert.ok( d.manhattanLength() == 0, "Empty initialization" );

			a.set( x, y, z );
			assert.ok( a.manhattanLength() == Math.abs( x ) + Math.abs( y ) + Math.abs( z ), "All components" );

		} );

		QUnit.test( "normalize", ( assert ) => {

			var a = new Vector3( x, 0, 0 );
			var b = new Vector3( 0, - y, 0 );
			var c = new Vector3( 0, 0, z );

			a.normalize();
			assert.ok( a.length() == 1, "Passed!" );
			assert.ok( a.x == 1, "Passed!" );

			b.normalize();
			assert.ok( b.length() == 1, "Passed!" );
			assert.ok( b.y == - 1, "Passed!" );

			c.normalize();
			assert.ok( c.length() == 1, "Passed!" );
			assert.ok( c.z == 1, "Passed!" );

		} );

		QUnit.test( "setLength", ( assert ) => {

			var a = new Vector3( x, 0, 0 );

			assert.ok( a.length() == x, "Passed!" );
			a.setLength( y );
			assert.ok( a.length() == y, "Passed!" );

			var a = new Vector3( 0, 0, 0 );
			assert.ok( a.length() == 0, "Passed!" );
			a.setLength( y );
			assert.ok( a.length() == 0, "Passed!" );
			a.setLength();
			assert.ok( isNaN( a.length() ), "Passed!" );

		} );

		QUnit.todo( "lerp", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "lerpVectors", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "cross", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( 2 * x, - y, 0.5 * z );
			var crossed = new Vector3( 18, 12, - 18 );

			a.cross( b );
			assert.ok( Math.abs( a.x - crossed.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - crossed.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - crossed.z ) <= eps, "Check z" );

		} );

		QUnit.test( "crossVectors", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( x, - y, z );
			var c = new Vector3();
			var crossed = new Vector3( 24, 0, - 12 );

			c.crossVectors( a, b );
			assert.ok( Math.abs( c.x - crossed.x ) <= eps, "Check x" );
			assert.ok( Math.abs( c.y - crossed.y ) <= eps, "Check y" );
			assert.ok( Math.abs( c.z - crossed.z ) <= eps, "Check z" );

		} );

		QUnit.test( "projectOnVector", ( assert ) => {

			var a = new Vector3( 1, 0, 0 );
			var b = new Vector3();
			var normal = new Vector3( 10, 0, 0 );

			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 1, 0, 0 ) ), "Passed!" );

			a.set( 0, 1, 0 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), "Passed!" );

			a.set( 0, 0, - 1 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), "Passed!" );

			a.set( - 1, 0, 0 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( - 1, 0, 0 ) ), "Passed!" );

		} );

		QUnit.test( "projectOnPlane", ( assert ) => {

			var a = new Vector3( 1, 0, 0 );
			var b = new Vector3();
			var normal = new Vector3( 1, 0, 0 );

			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), "Passed!" );

			a.set( 0, 1, 0 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 1, 0 ) ), "Passed!" );

			a.set( 0, 0, - 1 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, - 1 ) ), "Passed!" );

			a.set( - 1, 0, 0 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), "Passed!" );

		} );

		QUnit.test( "reflect", ( assert ) => {

			var a = new Vector3();
			var normal = new Vector3( 0, 1, 0 );
			var b = new Vector3();

			a.set( 0, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 0, 1, 0 ) ), "Passed!" );

			a.set( 1, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), "Passed!" );

			a.set( 1, - 1, 0 );
			normal.set( 0, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), "Passed!" );

		} );

		QUnit.test( "angleTo", ( assert ) => {

			var a = new Vector3( 0, - 0.18851655680720186, 0.9820700116639124 );
			var b = new Vector3( 0, 0.18851655680720186, - 0.9820700116639124 );

			assert.equal( a.angleTo( a ), 0 );
			assert.equal( a.angleTo( b ), Math.PI );

			var x = new Vector3( 1, 0, 0 );
			var y = new Vector3( 0, 1, 0 );
			var z = new Vector3( 0, 0, 1 );

			assert.equal( x.angleTo( y ), Math.PI / 2 );
			assert.equal( x.angleTo( z ), Math.PI / 2 );
			assert.equal( z.angleTo( x ), Math.PI / 2 );

			assert.ok( Math.abs( x.angleTo( new Vector3( 1, 1, 0 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );

		} );

		QUnit.todo( "distanceTo", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "distanceToSquared", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "manhattanDistanceTo", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setFromSpherical", ( assert ) => {

			var a = new Vector3();
			var phi = Math.acos( - 0.5 );
			var theta = Math.sqrt( Math.PI ) * phi;
			var sph = new Spherical( 10, phi, theta );
			var expected = new Vector3( - 4.677914006701843, - 5, - 7.288149322420796 );

			a.setFromSpherical( sph );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );

		} );

		QUnit.test( "setFromCylindrical", ( assert ) => {

			var a = new Vector3();
			var cyl = new Cylindrical( 10, Math.PI * 0.125, 20 );
			var expected = new Vector3( 3.826834323650898, 20, 9.238795325112868 );

			a.setFromCylindrical( cyl );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );

		} );

		QUnit.test( "setFromMatrixPosition", ( assert ) => {

			var a = new Vector3();
			var m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixPosition( m );
			assert.strictEqual( a.x, 7, "Check x" );
			assert.strictEqual( a.y, 19, "Check y" );
			assert.strictEqual( a.z, 37, "Check z" );

		} );

		QUnit.test( "setFromMatrixScale", ( assert ) => {

			var a = new Vector3();
			var m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			var expected = new Vector3( 25.573423705088842, 31.921779399024736, 35.70714214271425 );

			a.setFromMatrixScale( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );

		} );

		QUnit.test( "setFromMatrixColumn", ( assert ) => {

			var a = new Vector3();
			var m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixColumn( m, 0 );
			assert.strictEqual( a.x, 2, "Index 0: check x" );
			assert.strictEqual( a.y, 11, "Index 0: check y" );
			assert.strictEqual( a.z, 23, "Index 0: check z" );

			a.setFromMatrixColumn( m, 2 );
			assert.strictEqual( a.x, 5, "Index 2: check x" );
			assert.strictEqual( a.y, 17, "Index 2: check y" );
			assert.strictEqual( a.z, 31, "Index 2: check z" );

		} );

		QUnit.test( "equals", ( assert ) => {

			var a = new Vector3( x, 0, z );
			var b = new Vector3( 0, - y, 0 );

			assert.ok( a.x != b.x, "Passed!" );
			assert.ok( a.y != b.y, "Passed!" );
			assert.ok( a.z != b.z, "Passed!" );

			assert.ok( ! a.equals( b ), "Passed!" );
			assert.ok( ! b.equals( a ), "Passed!" );

			a.copy( b );
			assert.ok( a.x == b.x, "Passed!" );
			assert.ok( a.y == b.y, "Passed!" );
			assert.ok( a.z == b.z, "Passed!" );

			assert.ok( a.equals( b ), "Passed!" );
			assert.ok( b.equals( a ), "Passed!" );

		} );

		QUnit.test( "fromArray", ( assert ) => {

			var a = new Vector3();
			var array = [ 1, 2, 3, 4, 5, 6 ];

			a.fromArray( array );
			assert.strictEqual( a.x, 1, "No offset: check x" );
			assert.strictEqual( a.y, 2, "No offset: check y" );
			assert.strictEqual( a.z, 3, "No offset: check z" );

			a.fromArray( array, 3 );
			assert.strictEqual( a.x, 4, "With offset: check x" );
			assert.strictEqual( a.y, 5, "With offset: check y" );
			assert.strictEqual( a.z, 6, "With offset: check z" );

		} );

		QUnit.test( "toArray", ( assert ) => {

			var a = new Vector3( x, y, z );

			var array = a.toArray();
			assert.strictEqual( array[ 0 ], x, "No array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "No array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "No array, no offset: check z" );

			var array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, "With array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "With array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "With array, no offset: check z" );

			var array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, "With array and offset: check [0]" );
			assert.strictEqual( array[ 1 ], x, "With array and offset: check x" );
			assert.strictEqual( array[ 2 ], y, "With array and offset: check y" );
			assert.strictEqual( array[ 3 ], z, "With array and offset: check z" );

		} );

		QUnit.test( "fromBufferAttribute", ( assert ) => {

			var a = new Vector3();
			var attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );

			a.fromBufferAttribute( attr, 0 );
			assert.strictEqual( a.x, 1, "Offset 0: check x" );
			assert.strictEqual( a.y, 2, "Offset 0: check y" );
			assert.strictEqual( a.z, 3, "Offset 0: check z" );

			a.fromBufferAttribute( attr, 1 );
			assert.strictEqual( a.x, 4, "Offset 1: check x" );
			assert.strictEqual( a.y, 5, "Offset 1: check y" );
			assert.strictEqual( a.z, 6, "Offset 1: check z" );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( "setX,setY,setZ", ( assert ) => {

			var a = new Vector3();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );

			a.setX( x );
			a.setY( y );
			a.setZ( z );

			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z == z, "Passed!" );

		} );
		QUnit.test( "setComponent,getComponent", ( assert ) => {

			var a = new Vector3();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			a.setComponent( 2, 3 );
			assert.ok( a.getComponent( 0 ) == 1, "Passed!" );
			assert.ok( a.getComponent( 1 ) == 2, "Passed!" );
			assert.ok( a.getComponent( 2 ) == 3, "Passed!" );

		} );
		QUnit.test( "setComponent/getComponent exceptions", ( assert ) => {

			var a = new Vector3();

			assert.throws(
				function () {

					a.setComponent( 3, 0 );

				},
				/index is out of range/,
				"setComponent with an out of range index throws Error"
			);
			assert.throws(
				function () {

					a.getComponent( 3 );

				},
				/index is out of range/,
				"getComponent with an out of range index throws Error"
			);

		} );
		QUnit.test( "min/max/clamp", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( - x, - y, - z );
			var c = new Vector3();

			c.copy( a ).min( b );
			assert.ok( c.x == - x, "Passed!" );
			assert.ok( c.y == - y, "Passed!" );
			assert.ok( c.z == - z, "Passed!" );

			c.copy( a ).max( b );
			assert.ok( c.x == x, "Passed!" );
			assert.ok( c.y == y, "Passed!" );
			assert.ok( c.z == z, "Passed!" );

			c.set( - 2 * x, 2 * y, - 2 * z );
			c.clamp( b, a );
			assert.ok( c.x == - x, "Passed!" );
			assert.ok( c.y == y, "Passed!" );
			assert.ok( c.z == - z, "Passed!" );

		} );
		QUnit.test( "distanceTo/distanceToSquared", ( assert ) => {

			var a = new Vector3( x, 0, 0 );
			var b = new Vector3( 0, - y, 0 );
			var c = new Vector3( 0, 0, z );
			var d = new Vector3();

			assert.ok( a.distanceTo( d ) == x, "Passed!" );
			assert.ok( a.distanceToSquared( d ) == x * x, "Passed!" );

			assert.ok( b.distanceTo( d ) == y, "Passed!" );
			assert.ok( b.distanceToSquared( d ) == y * y, "Passed!" );

			assert.ok( c.distanceTo( d ) == z, "Passed!" );
			assert.ok( c.distanceToSquared( d ) == z * z, "Passed!" );

		} );
		QUnit.test( "setScalar/addScalar/subScalar", ( assert ) => {

			var a = new Vector3();
			var s = 3;

			a.setScalar( s );
			assert.strictEqual( a.x, s, "setScalar: check x" );
			assert.strictEqual( a.y, s, "setScalar: check y" );
			assert.strictEqual( a.z, s, "setScalar: check z" );

			a.addScalar( s );
			assert.strictEqual( a.x, 2 * s, "addScalar: check x" );
			assert.strictEqual( a.y, 2 * s, "addScalar: check y" );
			assert.strictEqual( a.z, 2 * s, "addScalar: check z" );

			a.subScalar( 2 * s );
			assert.strictEqual( a.x, 0, "subScalar: check x" );
			assert.strictEqual( a.y, 0, "subScalar: check y" );
			assert.strictEqual( a.z, 0, "subScalar: check z" );

		} );
		QUnit.test( "multiply/divide", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( 2 * x, 2 * y, 2 * z );
			var c = new Vector3( 4 * x, 4 * y, 4 * z );

			a.multiply( b );
			assert.strictEqual( a.x, x * b.x, "multiply: check x" );
			assert.strictEqual( a.y, y * b.y, "multiply: check y" );
			assert.strictEqual( a.z, z * b.z, "multiply: check z" );

			b.divide( c );
			assert.ok( Math.abs( b.x - 0.5 ) <= eps, "divide: check z" );
			assert.ok( Math.abs( b.y - 0.5 ) <= eps, "divide: check z" );
			assert.ok( Math.abs( b.z - 0.5 ) <= eps, "divide: check z" );

		} );
		QUnit.test( "multiply/divide", ( assert ) => {

			var a = new Vector3( x, y, z );
			var b = new Vector3( - x, - y, - z );

			a.multiplyScalar( - 2 );
			assert.ok( a.x == x * - 2, "Passed!" );
			assert.ok( a.y == y * - 2, "Passed!" );
			assert.ok( a.z == z * - 2, "Passed!" );

			b.multiplyScalar( - 2 );
			assert.ok( b.x == 2 * x, "Passed!" );
			assert.ok( b.y == 2 * y, "Passed!" );
			assert.ok( b.z == 2 * z, "Passed!" );

			a.divideScalar( - 2 );
			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z == z, "Passed!" );

			b.divideScalar( - 2 );
			assert.ok( b.x == - x, "Passed!" );
			assert.ok( b.y == - y, "Passed!" );
			assert.ok( b.z == - z, "Passed!" );

		} );
		QUnit.test( "project/unproject", ( assert ) => {

			var a = new Vector3( x, y, z );
			var camera = new PerspectiveCamera( 75, 16 / 9, 0.1, 300.0 );
			var projected = new Vector3( - 0.36653213611158914, - 0.9774190296309043, 1.0506835611870624 );

			a.project( camera );
			assert.ok( Math.abs( a.x - projected.x ) <= eps, "project: check x" );
			assert.ok( Math.abs( a.y - projected.y ) <= eps, "project: check y" );
			assert.ok( Math.abs( a.z - projected.z ) <= eps, "project: check z" );

			a.unproject( camera );
			assert.ok( Math.abs( a.x - x ) <= eps, "unproject: check x" );
			assert.ok( Math.abs( a.y - y ) <= eps, "unproject: check y" );
			assert.ok( Math.abs( a.z - z ) <= eps, "unproject: check z" );

		} );
		QUnit.test( "length/lengthSq", ( assert ) => {

			var a = new Vector3( x, 0, 0 );
			var b = new Vector3( 0, - y, 0 );
			var c = new Vector3( 0, 0, z );
			var d = new Vector3();

			assert.ok( a.length() == x, "Passed!" );
			assert.ok( a.lengthSq() == x * x, "Passed!" );
			assert.ok( b.length() == y, "Passed!" );
			assert.ok( b.lengthSq() == y * y, "Passed!" );
			assert.ok( c.length() == z, "Passed!" );
			assert.ok( c.lengthSq() == z * z, "Passed!" );
			assert.ok( d.length() == 0, "Passed!" );
			assert.ok( d.lengthSq() == 0, "Passed!" );

			a.set( x, y, z );
			assert.ok( a.length() == Math.sqrt( x * x + y * y + z * z ), "Passed!" );
			assert.ok( a.lengthSq() == ( x * x + y * y + z * z ), "Passed!" );

		} );
		QUnit.test( "lerp/clone", ( assert ) => {

			var a = new Vector3( x, 0, z );
			var b = new Vector3( 0, - y, 0 );

			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), "Passed!" );
			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), "Passed!" );

			assert.ok( a.clone().lerp( b, 0 ).equals( a ), "Passed!" );

			assert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, "Passed!" );
			assert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, "Passed!" );
			assert.ok( a.clone().lerp( b, 0.5 ).z == z * 0.5, "Passed!" );

			assert.ok( a.clone().lerp( b, 1 ).equals( b ), "Passed!" );

		} );

		QUnit.test( 'randomDirection', ( assert ) => {

			var vec = new Vector3();

			vec.randomDirection();

			var zero = new Vector3();
			assert.notDeepEqual(
				vec,
				zero,
				'randomizes at least one component of the vector'
			);

			assert.ok( ( 1 - vec.length() ) <= Number.EPSILON, 'produces a unit vector' );

		} );

	} );

} );
