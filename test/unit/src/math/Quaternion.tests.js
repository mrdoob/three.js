/* global QUnit */

import { BufferAttribute } from '../../../../src/core/BufferAttribute';
import { Quaternion } from '../../../../src/math/Quaternion';
import { Vector3 } from '../../../../src/math/Vector3';
import { Vector4 } from '../../../../src/math/Vector4';
import { Euler } from '../../../../src/math/Euler';
import { Matrix4 } from '../../../../src/math/Matrix4';
import {
	x,
	y,
	z,
	w,
	eps
} from './Constants.tests';

const orders = [ 'XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY' ];
const eulerAngles = new Euler( 0.1, - 0.3, 0.25 );

function qSub( a, b ) {

	var result = new Quaternion();
	result.copy( a );

	result.x -= b.x;
	result.y -= b.y;
	result.z -= b.z;
	result.w -= b.w;

	return result;

}

function doSlerpObject( aArr, bArr, t ) {

	var a = new Quaternion().fromArray( aArr ),
		b = new Quaternion().fromArray( bArr ),
		c = new Quaternion().fromArray( aArr );

	c.slerp( b, t );

	return {

		equals: function ( x, y, z, w, maxError ) {

			if ( maxError === undefined ) maxError = Number.EPSILON;

			return Math.abs( x - c.x ) <= maxError &&
				Math.abs( y - c.y ) <= maxError &&
				Math.abs( z - c.z ) <= maxError &&
				Math.abs( w - c.w ) <= maxError;

		},

		length: c.length(),

		dotA: c.dot( a ),
		dotB: c.dot( b )

	};

}

function doSlerpArray( a, b, t ) {

	var result = [ 0, 0, 0, 0 ];

	Quaternion.slerpFlat( result, 0, a, 0, b, 0, t );

	function arrDot( a, b ) {

		return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] +
			a[ 2 ] * b[ 2 ] + a[ 3 ] * b[ 3 ];

	}

	return {

		equals: function ( x, y, z, w, maxError ) {

			if ( maxError === undefined ) maxError = Number.EPSILON;

			return Math.abs( x - result[ 0 ] ) <= maxError &&
				Math.abs( y - result[ 1 ] ) <= maxError &&
				Math.abs( z - result[ 2 ] ) <= maxError &&
				Math.abs( w - result[ 3 ] ) <= maxError;

		},

		length: Math.sqrt( arrDot( result, result ) ),

		dotA: arrDot( result, a ),
		dotB: arrDot( result, b )

	};

}

function slerpTestSkeleton( doSlerp, maxError, assert ) {

	var a, b, result;

	a = [
		0.6753410084407496,
		0.4087830051091744,
		0.32856700410659473,
		0.5185120064806223
	];

	b = [
		0.6602792107657797,
		0.43647413932562285,
		0.35119011210236006,
		0.5001871596632682
	];

	var maxNormError = 0;

	function isNormal( result ) {

		var normError = Math.abs( 1 - result.length );
		maxNormError = Math.max( maxNormError, normError );
		return normError <= maxError;

	}

	result = doSlerp( a, b, 0 );
	assert.ok( result.equals(
		a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], 0 ), "Exactly A @ t = 0" );

	result = doSlerp( a, b, 1 );
	assert.ok( result.equals(
		b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ], 0 ), "Exactly B @ t = 1" );

	result = doSlerp( a, b, 0.5 );
	assert.ok( Math.abs( result.dotA - result.dotB ) <= Number.EPSILON, "Symmetry at 0.5" );
	assert.ok( isNormal( result ), "Approximately normal (at 0.5)" );

	result = doSlerp( a, b, 0.25 );
	assert.ok( result.dotA > result.dotB, "Interpolating at 0.25" );
	assert.ok( isNormal( result ), "Approximately normal (at 0.25)" );

	result = doSlerp( a, b, 0.75 );
	assert.ok( result.dotA < result.dotB, "Interpolating at 0.75" );
	assert.ok( isNormal( result ), "Approximately normal (at 0.75)" );

	var D = Math.SQRT1_2;

	result = doSlerp( [ 1, 0, 0, 0 ], [ 0, 0, 1, 0 ], 0.5 );
	assert.ok( result.equals( D, 0, D, 0 ), "X/Z diagonal from axes" );
	assert.ok( isNormal( result ), "Approximately normal (X/Z diagonal)" );

	result = doSlerp( [ 0, D, 0, D ], [ 0, - D, 0, D ], 0.5 );
	assert.ok( result.equals( 0, 0, 0, 1 ), "W-Unit from diagonals" );
	assert.ok( isNormal( result ), "Approximately normal (W-Unit)" );

}

function changeEulerOrder( euler, order ) {

	return new Euler( euler.x, euler.y, euler.z, order );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Quaternion', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Quaternion();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );
			assert.ok( a.w == 1, "Passed!" );

			var a = new Quaternion( x, y, z, w );
			assert.ok( a.x === x, "Passed!" );
			assert.ok( a.y === y, "Passed!" );
			assert.ok( a.z === z, "Passed!" );
			assert.ok( a.w === w, "Passed!" );

		} );

		// STATIC STUFF
		QUnit.test( "slerp", ( assert ) => {

			slerpTestSkeleton( doSlerpObject, Number.EPSILON, assert );

		} );

		QUnit.test( "slerpFlat", ( assert ) => {

			slerpTestSkeleton( doSlerpArray, Number.EPSILON, assert );

		} );

		// PROPERTIES
		QUnit.test( "properties", ( assert ) => {

			assert.expect( 8 );

			var a = new Quaternion();
			a._onChange( function () {

				assert.ok( true, "onChange called" );

			} );

			a.x = x;
			a.y = y;
			a.z = z;
			a.w = w;

			assert.strictEqual( a.x, x, "Check x" );
			assert.strictEqual( a.y, y, "Check y" );
			assert.strictEqual( a.z, z, "Check z" );
			assert.strictEqual( a.w, w, "Check w" );

		} );

		QUnit.test( "x", ( assert ) => {

			var a = new Quaternion();
			assert.ok( a.x === 0, "Passed!" );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.x === 1, "Passed!" );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.x === 4, "Passed!" );

			a = new Quaternion( 7, 8, 9 );
			a.x = 10;
			assert.ok( a.x === 10, "Passed!" );

			a = new Quaternion( 11, 12, 13 );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, "Passed!" );
			a.x = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.x === 14, "Passed!" );

		} );

		QUnit.test( "y", ( assert ) => {

			var a = new Quaternion();
			assert.ok( a.y === 0, "Passed!" );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.y === 2, "Passed!" );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.y === 5, "Passed!" );

			a = new Quaternion( 7, 8, 9 );
			a.y = 10;
			assert.ok( a.y === 10, "Passed!" );

			a = new Quaternion( 11, 12, 13 );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, "Passed!" );
			a.y = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.y === 14, "Passed!" );

		} );

		QUnit.test( "z", ( assert ) => {


			var a = new Quaternion();
			assert.ok( a.z === 0, "Passed!" );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.z === 3, "Passed!" );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.z === 6, "Passed!" );

			a = new Quaternion( 7, 8, 9 );
			a.z = 10;
			assert.ok( a.z === 10, "Passed!" );

			a = new Quaternion( 11, 12, 13 );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, "Passed!" );
			a.z = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.z === 14, "Passed!" );

		} );

		QUnit.test( "w", ( assert ) => {

			var a = new Quaternion();
			assert.ok( a.w === 1, "Passed!" );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.w === 1, "Passed!" );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.w === 1, "Passed!" );

			a = new Quaternion( 7, 8, 9 );
			a.w = 10;
			assert.ok( a.w === 10, "Passed!" );

			a = new Quaternion( 11, 12, 13 );
			var b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, "Passed!" );
			a.w = 14;
			assert.ok( b, "Passed!" );
			assert.ok( a.w === 14, "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.test( "set", ( assert ) => {

			var a = new Quaternion();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );
			assert.ok( a.w == 1, "Passed!" );

			a.set( x, y, z, w );
			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z === z, "Passed!" );
			assert.ok( a.w === w, "Passed!" );

		} );

		QUnit.test( "clone", ( assert ) => {


			var a = new Quaternion().clone();
			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z == 0, "Passed!" );
			assert.ok( a.w == 1, "Passed!" );

			var b = a.set( x, y, z, w ).clone();
			assert.ok( b.x == x, "Passed!" );
			assert.ok( b.y == y, "Passed!" );
			assert.ok( b.z === z, "Passed!" );
			assert.ok( b.w === w, "Passed!" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Quaternion( x, y, z, w );
			var b = new Quaternion().copy( a );
			assert.ok( b.x == x, "Passed!" );
			assert.ok( b.y == y, "Passed!" );
			assert.ok( b.z == z, "Passed!" );
			assert.ok( b.w == w, "Passed!" );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = 0;
			a.w = - 1;
			assert.ok( b.x == x, "Passed!" );
			assert.ok( b.y == y, "Passed!" );

		} );

		QUnit.test( "setFromEuler/setFromQuaternion", ( assert ) => {

			var angles = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];

			// ensure euler conversion to/from Quaternion matches.
			for ( var i = 0; i < orders.length; i ++ ) {

				for ( var j = 0; j < angles.length; j ++ ) {

					var eulers2 = new Euler().setFromQuaternion( new Quaternion().setFromEuler( new Euler( angles[ j ].x, angles[ j ].y, angles[ j ].z, orders[ i ] ) ), orders[ i ] );
					var newAngle = new Vector3( eulers2.x, eulers2.y, eulers2.z );
					assert.ok( newAngle.distanceTo( angles[ j ] ) < 0.001, "Passed!" );

				}

			}

		} );

		QUnit.test( "setFromAxisAngle", ( assert ) => {

			// TODO: find cases to validate.
			// assert.ok( true, "Passed!" );

			var zero = new Quaternion();

			var a = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), 0 );
			assert.ok( a.equals( zero ), "Passed!" );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), 0 );
			assert.ok( a.equals( zero ), "Passed!" );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 0, 1 ), 0 );
			assert.ok( a.equals( zero ), "Passed!" );

			var b1 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), Math.PI );
			assert.ok( ! a.equals( b1 ), "Passed!" );
			var b2 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), - Math.PI );
			assert.ok( ! a.equals( b2 ), "Passed!" );

			b1.multiply( b2 );
			assert.ok( a.equals( b1 ), "Passed!" );

		} );

		QUnit.test( "setFromEuler/setFromRotationMatrix", ( assert ) => {

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( var i = 0; i < orders.length; i ++ ) {

				var q = new Quaternion().setFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				var m = new Matrix4().makeRotationFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				var q2 = new Quaternion().setFromRotationMatrix( m );

				assert.ok( qSub( q, q2 ).length() < 0.001, "Passed!" );

			}

		} );

		QUnit.test( "setFromRotationMatrix", ( assert ) => {

			// contrived examples purely to please the god of code coverage...
			// match conditions in various 'else [if]' blocks

			var a = new Quaternion();
			var q = new Quaternion( - 9, - 2, 3, - 4 ).normalize();
			var m = new Matrix4().makeRotationFromQuaternion( q );
			var expected = new Vector4( 0.8581163303210332, 0.19069251784911848, - 0.2860387767736777, 0.38138503569823695 );

			a.setFromRotationMatrix( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "m11 > m22 && m11 > m33: check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "m11 > m22 && m11 > m33: check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "m11 > m22 && m11 > m33: check z" );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, "m11 > m22 && m11 > m33: check w" );

			var q = new Quaternion( - 1, - 2, 1, - 1 ).normalize();
			m.makeRotationFromQuaternion( q );
			var expected = new Vector4( 0.37796447300922714, 0.7559289460184544, - 0.37796447300922714, 0.37796447300922714 );

			a.setFromRotationMatrix( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "m22 > m33: check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "m22 > m33: check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "m22 > m33: check z" );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, "m22 > m33: check w" );

		} );

		QUnit.test( "setFromUnitVectors", ( assert ) => {

			var a = new Quaternion();
			var b = new Vector3( 1, 0, 0 );
			var c = new Vector3( 0, 1, 0 );
			var expected = new Quaternion( 0, 0, Math.sqrt( 2 ) / 2, Math.sqrt( 2 ) / 2 );

			a.setFromUnitVectors( b, c );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, "Check w" );

		} );

		QUnit.test( "angleTo", ( assert ) => {

			var a = new Quaternion();
			var b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			var c = new Quaternion().setFromEuler( new Euler( 0, Math.PI * 2, 0 ) );

			assert.ok( a.angleTo( a ) === 0, "Passed!" );
			assert.ok( a.angleTo( b ) === Math.PI, "Passed!" );
			assert.ok( a.angleTo( c ) === 0, "Passed!" );

		} );

		QUnit.test( "rotateTowards", ( assert ) => {

			var a = new Quaternion();
			var b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			var c = new Quaternion();

			var halfPI = Math.PI * 0.5;

			a.rotateTowards( b, 0 );
			assert.ok( a.equals( a ) === true, "Passed!" );

			a.rotateTowards( b, Math.PI * 2 ); // test overshoot
			assert.ok( a.equals( b ) === true, "Passed!" );

			a.set( 0, 0, 0, 1 );
			a.rotateTowards( b, halfPI );
			assert.ok( a.angleTo( c ) - halfPI <= eps, "Passed!" );

		} );

		QUnit.test( "identity", ( assert ) => {

			var a = new Quaternion();

			a.set( x, y, z, w );
			a.identity();

			assert.ok( a.x == 0, "Passed!" );
			assert.ok( a.y == 0, "Passed!" );
			assert.ok( a.z === 0, "Passed!" );
			assert.ok( a.w === 1, "Passed!" );

		} );

		QUnit.test( "invert/conjugate", ( assert ) => {

			var a = new Quaternion( x, y, z, w );

			// TODO: add better validation here.

			var b = a.clone().conjugate();

			assert.ok( a.x == - b.x, "Passed!" );
			assert.ok( a.y == - b.y, "Passed!" );
			assert.ok( a.z == - b.z, "Passed!" );
			assert.ok( a.w == b.w, "Passed!" );

		} );

		QUnit.test( "dot", ( assert ) => {

			var a = new Quaternion();
			var b = new Quaternion();

			assert.ok( a.dot( b ) === 1, "Passed!" );
			a = new Quaternion( 1, 2, 3, 1 );
			b = new Quaternion( 3, 2, 1, 1 );

			assert.ok( a.dot( b ) === 11, "Passed!" );


		} );

		QUnit.test( "normalize/length/lengthSq", ( assert ) => {

			var a = new Quaternion( x, y, z, w );

			assert.ok( a.length() != 1, "Passed!" );
			assert.ok( a.lengthSq() != 1, "Passed!" );
			a.normalize();
			assert.ok( a.length() == 1, "Passed!" );
			assert.ok( a.lengthSq() == 1, "Passed!" );

			a.set( 0, 0, 0, 0 );
			assert.ok( a.lengthSq() == 0, "Passed!" );
			assert.ok( a.length() == 0, "Passed!" );
			a.normalize();
			assert.ok( a.lengthSq() == 1, "Passed!" );
			assert.ok( a.length() == 1, "Passed!" );

		} );

		QUnit.test( "multiplyQuaternions/multiply", ( assert ) => {

			var angles = [ new Euler( 1, 0, 0 ), new Euler( 0, 1, 0 ), new Euler( 0, 0, 1 ) ];

			var q1 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 0 ], "XYZ" ) );
			var q2 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 1 ], "XYZ" ) );
			var q3 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 2 ], "XYZ" ) );

			var q = new Quaternion().multiplyQuaternions( q1, q2 ).multiply( q3 );

			var m1 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 0 ], "XYZ" ) );
			var m2 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 1 ], "XYZ" ) );
			var m3 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 2 ], "XYZ" ) );

			var m = new Matrix4().multiplyMatrices( m1, m2 ).multiply( m3 );

			var qFromM = new Quaternion().setFromRotationMatrix( m );

			assert.ok( qSub( q, qFromM ).length() < 0.001, "Passed!" );

		} );

		QUnit.test( "premultiply", ( assert ) => {

			var a = new Quaternion( x, y, z, w );
			var b = new Quaternion( 2 * x, - y, - 2 * z, w );
			var expected = new Quaternion( 42, - 32, - 2, 58 );

			a.premultiply( b );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, "Check z" );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, "Check w" );

		} );

		QUnit.test( "slerp", ( assert ) => {

			var a = new Quaternion( x, y, z, w );
			var b = new Quaternion( - x, - y, - z, - w );

			var c = a.clone().slerp( b, 0 );
			var d = a.clone().slerp( b, 1 );

			assert.ok( a.equals( c ), "Passed" );
			assert.ok( b.equals( d ), "Passed" );


			var D = Math.SQRT1_2;

			var e = new Quaternion( 1, 0, 0, 0 );
			var f = new Quaternion( 0, 0, 1, 0 );
			var expected = new Quaternion( D, 0, D, 0 );
			var result = e.clone().slerp( f, 0.5 );
			assert.ok( Math.abs( result.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( result.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( result.z - expected.z ) <= eps, "Check z" );
			assert.ok( Math.abs( result.w - expected.w ) <= eps, "Check w" );


			var g = new Quaternion( 0, D, 0, D );
			var h = new Quaternion( 0, - D, 0, D );
			expected = new Quaternion( 0, 0, 0, 1 );
			result = g.clone().slerp( h, 0.5 );

			assert.ok( Math.abs( result.x - expected.x ) <= eps, "Check x" );
			assert.ok( Math.abs( result.y - expected.y ) <= eps, "Check y" );
			assert.ok( Math.abs( result.z - expected.z ) <= eps, "Check z" );
			assert.ok( Math.abs( result.w - expected.w ) <= eps, "Check w" );

		} );

		QUnit.test( "equals", ( assert ) => {

			var a = new Quaternion( x, y, z, w );
			var b = new Quaternion( - x, - y, - z, - w );

			assert.ok( a.x != b.x, "Passed!" );
			assert.ok( a.y != b.y, "Passed!" );

			assert.ok( ! a.equals( b ), "Passed!" );
			assert.ok( ! b.equals( a ), "Passed!" );

			a.copy( b );
			assert.ok( a.x == b.x, "Passed!" );
			assert.ok( a.y == b.y, "Passed!" );

			assert.ok( a.equals( b ), "Passed!" );
			assert.ok( b.equals( a ), "Passed!" );

		} );

		QUnit.test( "fromArray", ( assert ) => {

			var a = new Quaternion();
			a.fromArray( [ x, y, z, w ] );
			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z === z, "Passed!" );
			assert.ok( a.w === w, "Passed!" );

			a.fromArray( [ undefined, x, y, z, w, undefined ], 1 );
			assert.ok( a.x == x, "Passed!" );
			assert.ok( a.y == y, "Passed!" );
			assert.ok( a.z === z, "Passed!" );
			assert.ok( a.w === w, "Passed!" );

		} );

		QUnit.test( "toArray", ( assert ) => {

			var a = new Quaternion( x, y, z, w );

			var array = a.toArray();
			assert.strictEqual( array[ 0 ], x, "No array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "No array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "No array, no offset: check z" );
			assert.strictEqual( array[ 3 ], w, "No array, no offset: check w" );

			var array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, "With array, no offset: check x" );
			assert.strictEqual( array[ 1 ], y, "With array, no offset: check y" );
			assert.strictEqual( array[ 2 ], z, "With array, no offset: check z" );
			assert.strictEqual( array[ 3 ], w, "With array, no offset: check w" );

			var array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, "With array and offset: check [0]" );
			assert.strictEqual( array[ 1 ], x, "With array and offset: check x" );
			assert.strictEqual( array[ 2 ], y, "With array and offset: check y" );
			assert.strictEqual( array[ 3 ], z, "With array and offset: check z" );
			assert.strictEqual( array[ 4 ], w, "With array and offset: check w" );

		} );

		QUnit.test( "fromBufferAttribute", ( assert ) => {

			var a = new Quaternion();

			var attribute = new BufferAttribute( new Float32Array( [

				0, 0, 0, 1,
				.7, 0, 0, .7,
				0, .7, 0, .7,

			] ), 4 );

			a.fromBufferAttribute( attribute, 0 );
			assert.numEqual( a.x, 0, 'index 0, component x' );
			assert.numEqual( a.y, 0, 'index 0, component y' );
			assert.numEqual( a.z, 0, 'index 0, component z' );
			assert.numEqual( a.w, 1, 'index 0, component w' );

			a.fromBufferAttribute( attribute, 1 );
			assert.numEqual( a.x, .7, 'index 1, component x' );
			assert.numEqual( a.y, 0, 'index 1, component y' );
			assert.numEqual( a.z, 0, 'index 1, component z' );
			assert.numEqual( a.w, .7, 'index 1, component w' );

			a.fromBufferAttribute( attribute, 2 );
			assert.numEqual( a.x, 0, 'index 2, component x' );
			assert.numEqual( a.y, .7, 'index 2, component y' );
			assert.numEqual( a.z, 0, 'index 2, component z' );
			assert.numEqual( a.w, .7, 'index 2, component w' );

		} );

		QUnit.test( "_onChange", ( assert ) => {

			var b = false;
			var f = function () {

				b = true;

			};

			var a = new Quaternion( 11, 12, 13, 1 );
			a._onChange( f );
			assert.ok( a._onChangeCallback === f, "Passed!" );

			a._onChangeCallback();
			assert.ok( b, "Passed!" );


		} );

		QUnit.test( "_onChangeCallback", ( assert ) => {

			var b = false;
			var a = new Quaternion( 11, 12, 13, 1 );
			var f = function () {

				b = true;
				assert.ok( a === this, "Passed!" );

			};

			a._onChangeCallback = f;
			assert.ok( a._onChangeCallback === f, "Passed!" );


			a._onChangeCallback();
			assert.ok( b, "Passed!" );

		} );

		// OTHERS
		QUnit.test( "multiplyVector3", ( assert ) => {

			var angles = [ new Euler( 1, 0, 0 ), new Euler( 0, 1, 0 ), new Euler( 0, 0, 1 ) ];

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( var i = 0; i < orders.length; i ++ ) {

				for ( var j = 0; j < angles.length; j ++ ) {

					var q = new Quaternion().setFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );
					var m = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );

					var v0 = new Vector3( 1, 0, 0 );
					var qv = v0.clone().applyQuaternion( q );
					var mv = v0.clone().applyMatrix4( m );

					assert.ok( qv.distanceTo( mv ) < 0.001, "Passed!" );

				}

			}

		} );

	} );

} );
