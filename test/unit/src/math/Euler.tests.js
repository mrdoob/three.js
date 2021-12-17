/* global QUnit */

import { Euler } from '../../../../src/math/Euler';
import { Matrix4 } from '../../../../src/math/Matrix4';
import { Quaternion } from '../../../../src/math/Quaternion';
import { Vector3 } from '../../../../src/math/Vector3';
import { x, y, z } from './Constants.tests';

const eulerZero = new Euler( 0, 0, 0, "XYZ" );
const eulerAxyz = new Euler( 1, 0, 0, "XYZ" );
const eulerAzyx = new Euler( 0, 1, 0, "ZYX" );

function matrixEquals4( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	if ( a.elements.length != b.elements.length ) {

		return false;

	}

	for ( var i = 0, il = a.elements.length; i < il; i ++ ) {

		var delta = a.elements[ i ] - b.elements[ i ];
		if ( delta > tolerance ) {

			return false;

		}

	}

	return true;

}

function eulerEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	var diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );

	return ( diff < tolerance );

}

function quatEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	var diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z ) + Math.abs( a.w - b.w );

	return ( diff < tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Euler', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Euler();
			assert.ok( a.equals( eulerZero ), "Passed!" );
			assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
			assert.ok( ! a.equals( eulerAzyx ), "Passed!" );

		} );

		// STATIC STUFF
		QUnit.test( "RotationOrders", ( assert ) => {

			assert.ok( Array.isArray( Euler.RotationOrders ), "Passed!" );
			assert.deepEqual( Euler.RotationOrders, [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ], "Passed!" );

		} );

		QUnit.test( "DefaultOrder", ( assert ) => {

			assert.equal( Euler.DefaultOrder, "XYZ", "Passed!" );


		} );

		// PROPERTIES STUFF
		QUnit.test( "x", ( assert ) => {

			var a = new Euler();
			assert.ok( a.x === 0, "Passed!" );

			a = new Euler( 1, 2, 3 );
			assert.ok( a.x === 1, "Passed!" );

			a = new Euler( 4, 5, 6, "XYZ" );
			assert.ok( a.x === 4, "Passed!" );

			a = new Euler( 7, 8, 9, "XYZ" );
			a.x = 10;
			assert.ok( a.x === 10, "Passed!" );

			a = new Euler( 11, 12, 13, "XYZ" );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			a.x = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.x === 14, "Passed!" );

		} );

		QUnit.test( "y", ( assert ) => {


			var a = new Euler();
			assert.ok( a.y === 0, "Passed!" );

			a = new Euler( 1, 2, 3 );
			assert.ok( a.y === 2, "Passed!" );

			a = new Euler( 4, 5, 6, "XYZ" );
			assert.ok( a.y === 5, "Passed!" );

			a = new Euler( 7, 8, 9, "XYZ" );
			a.y = 10;
			assert.ok( a.y === 10, "Passed!" );

			a = new Euler( 11, 12, 13, "XYZ" );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			a.y = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.y === 14, "Passed!" );

		} );

		QUnit.test( "z", ( assert ) => {


			var a = new Euler();
			assert.ok( a.z === 0, "Passed!" );

			a = new Euler( 1, 2, 3 );
			assert.ok( a.z === 3, "Passed!" );

			a = new Euler( 4, 5, 6, "XYZ" );
			assert.ok( a.z === 6, "Passed!" );

			a = new Euler( 7, 8, 9, "XYZ" );
			a.z = 10;
			assert.ok( a.z === 10, "Passed!" );

			a = new Euler( 11, 12, 13, "XYZ" );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			a.z = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.z === 14, "Passed!" );

		} );

		QUnit.test( "order", ( assert ) => {


			var a = new Euler();
			assert.ok( a.order === Euler.DefaultOrder, "Passed!" );

			a = new Euler( 1, 2, 3 );
			assert.ok( a.order === Euler.DefaultOrder, "Passed!" );

			a = new Euler( 4, 5, 6, "YZX" );
			assert.ok( a.order === "YZX", "Passed!" );

			a = new Euler( 7, 8, 9, "YZX" );
			a.order = "ZXY";
			assert.ok( a.order === "ZXY", "Passed!" );

			a = new Euler( 11, 12, 13, "YZX" );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			a.order = "ZXY";
			assert.ok( b, "Passed!" );
			assert.ok( a.order === "ZXY", "Passed!" );


		} );

		// PUBLIC STUFF
		QUnit.test( "isEuler", ( assert ) => {

			var a = new Euler();
			assert.ok( a.isEuler, "Passed!" );
			var b = new Vector3();
			assert.ok( ! b.isEuler, "Passed!" );


		} );

		QUnit.test( "set/setFromVector3/toVector3", ( assert ) => {

			var a = new Euler();

			a.set( 0, 1, 0, "ZYX" );
			assert.ok( a.equals( eulerAzyx ), "Passed!" );
			assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
			assert.ok( ! a.equals( eulerZero ), "Passed!" );

			var vec = new Vector3( 0, 1, 0 );

			var b = new Euler().setFromVector3( vec, "ZYX" );
			assert.ok( a.equals( b ), "Passed!" );

			var c = b.toVector3();
			assert.ok( c.equals( vec ), "Passed!" );

		} );

		QUnit.test( "clone/copy/equals", ( assert ) => {

			var a = eulerAxyz.clone();
			assert.ok( a.equals( eulerAxyz ), "Passed!" );
			assert.ok( ! a.equals( eulerZero ), "Passed!" );
			assert.ok( ! a.equals( eulerAzyx ), "Passed!" );

			a.copy( eulerAzyx );
			assert.ok( a.equals( eulerAzyx ), "Passed!" );
			assert.ok( ! a.equals( eulerAxyz ), "Passed!" );
			assert.ok( ! a.equals( eulerZero ), "Passed!" );

		} );

		QUnit.test( "Quaternion.setFromEuler/Euler.fromQuaternion", ( assert ) => {

			var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( var i = 0; i < testValues.length; i ++ ) {

				var v = testValues[ i ];
				var q = new Quaternion().setFromEuler( v );

				var v2 = new Euler().setFromQuaternion( q, v.order );
				var q2 = new Quaternion().setFromEuler( v2 );
				assert.ok( quatEquals( q, q2 ), "Passed!" );

			}

		} );

		QUnit.test( "Matrix4.setFromEuler/Euler.fromRotationMatrix", ( assert ) => {

			var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( var i = 0; i < testValues.length; i ++ ) {

				var v = testValues[ i ];
				var m = new Matrix4().makeRotationFromEuler( v );

				var v2 = new Euler().setFromRotationMatrix( m, v.order );
				var m2 = new Matrix4().makeRotationFromEuler( v2 );
				assert.ok( matrixEquals4( m, m2, 0.0001 ), "Passed!" );

			}

		} );

		QUnit.test( "reorder", ( assert ) => {

			var testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( var i = 0; i < testValues.length; i ++ ) {

				var v = testValues[ i ];
				var q = new Quaternion().setFromEuler( v );

				v.reorder( 'YZX' );
				var q2 = new Quaternion().setFromEuler( v );
				assert.ok( quatEquals( q, q2 ), "Passed!" );

				v.reorder( 'ZXY' );
				var q3 = new Quaternion().setFromEuler( v );
				assert.ok( quatEquals( q, q3 ), "Passed!" );

			}

		} );

		QUnit.test( "set/get properties, check callbacks", ( assert ) => {

			var a = new Euler();
			a._onChange( function () {

				assert.step( "set: onChange called" );

			} );

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.order = "ZYX";

			assert.strictEqual( a.x, 1, "get: check x" );
			assert.strictEqual( a.y, 2, "get: check y" );
			assert.strictEqual( a.z, 3, "get: check z" );
			assert.strictEqual( a.order, "ZYX", "get: check order" );

			assert.verifySteps( Array( 4 ).fill( "set: onChange called" ) );

		} );

		QUnit.test( "clone/copy, check callbacks", ( assert ) => {

			var a = new Euler( 1, 2, 3, "ZXY" );
			var b = new Euler( 4, 5, 6, "XZY" );
			var cbSucceed = function () {

				assert.ok( true );
				assert.step( "onChange called" );

			};
			var cbFail = function () {

				assert.ok( false );

			};
			a._onChange( cbFail );
			b._onChange( cbFail );

			// clone doesn't trigger onChange
			a = b.clone();
			assert.ok( a.equals( b ), "clone: check if a equals b" );

			// copy triggers onChange once
			a = new Euler( 1, 2, 3, "ZXY" );
			a._onChange( cbSucceed );
			a.copy( b );
			assert.ok( a.equals( b ), "copy: check if a equals b" );
			assert.verifySteps( [ "onChange called" ] );

		} );

		QUnit.test( "toArray", ( assert ) => {

			var order = "YXZ";
			var a = new Euler( x, y, z, order );

			var array = a.toArray();
			assert.strictEqual( array[ 0 ], x, "No array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "No array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "No array, no offset: check z" );
			assert.strictEqual( array[ 3 ], order, "No array, no offset: check order" );

			var array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, "With array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "With array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "With array, no offset: check z" );
			assert.strictEqual( array[ 3 ], order, "With array, no offset: check order" );

			var array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, "With array and offset: check [0]" );
			assert.strictEqual( array[ 1 ], x, "With array and offset: check x" );
			assert.strictEqual( array[ 2 ], y, "With array and offset: check y" );
			assert.strictEqual( array[ 3 ], z, "With array and offset: check z" );
			assert.strictEqual( array[ 4 ], order, "With array and offset: check order" );

		} );

		QUnit.test( "fromArray", ( assert ) => {

			var a = new Euler();
			var array = [ x, y, z ];
			var cb = function () {

				assert.step( "onChange called" );

			};
			a._onChange( cb );

			a.fromArray( array );
			assert.strictEqual( a.x, x, "No order: check x" );
			assert.strictEqual( a.y, y, "No order: check y" );
			assert.strictEqual( a.z, z, "No order: check z" );
			assert.strictEqual( a.order, "XYZ", "No order: check order" );

			a = new Euler();
			array = [ x, y, z, "ZXY" ];
			a._onChange( cb );
			a.fromArray( array );
			assert.strictEqual( a.x, x, "With order: check x" );
			assert.strictEqual( a.y, y, "With order: check y" );
			assert.strictEqual( a.z, z, "With order: check z" );
			assert.strictEqual( a.order, "ZXY", "With order: check order" );

			assert.verifySteps( Array( 2 ).fill( "onChange called" ) );

		} );

		QUnit.test( "_onChange", ( assert ) => {

			var f = function () {

				var b = true;

			};

			var a = new Euler( 11, 12, 13, "XYZ" );
			a._onChange( f );
			assert.ok( a._onChangeCallback === f, "Passed!" );

		} );

		QUnit.test( "_onChangeCallback", ( assert ) => {

			var b = false;
			var a = new Euler( 11, 12, 13, "XYZ" );
			var f = function () {

				b = true;
				assert.ok( a === this, "Passed!" );

			};

			a._onChangeCallback = f;
			assert.ok( a._onChangeCallback === f, "Passed!" );


			a._onChangeCallback();
			assert.ok( b, "Passed!" );

		} );

	} );

} );
