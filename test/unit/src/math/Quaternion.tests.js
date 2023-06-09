/* global QUnit */

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Vector4 } from '../../../../src/math/Vector4.js';
import { Euler } from '../../../../src/math/Euler.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import {
	x,
	y,
	z,
	w,
	eps
} from '../../utils/math-constants.js';

const orders = [ 'XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY' ];
const eulerAngles = new Euler( 0.1, - 0.3, 0.25 );

function qSub( a, b ) {

	const result = new Quaternion();
	result.copy( a );

	result.x -= b.x;
	result.y -= b.y;
	result.z -= b.z;
	result.w -= b.w;

	return result;

}

function doSlerpObject( aArr, bArr, t ) {

	const a = new Quaternion().fromArray( aArr ),
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

	const result = [ 0, 0, 0, 0 ];

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

	let result;

	const a = [
		0.6753410084407496,
		0.4087830051091744,
		0.32856700410659473,
		0.5185120064806223
	];

	const b = [
		0.6602792107657797,
		0.43647413932562285,
		0.35119011210236006,
		0.5001871596632682
	];

	let maxNormError = 0;

	function isNormal( result ) {

		const normError = Math.abs( 1 - result.length );
		maxNormError = Math.max( maxNormError, normError );
		return normError <= maxError;

	}

	result = doSlerp( a, b, 0 );
	assert.ok( result.equals(
		a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], 0 ), 'Exactly A @ t = 0' );

	result = doSlerp( a, b, 1 );
	assert.ok( result.equals(
		b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ], 0 ), 'Exactly B @ t = 1' );

	result = doSlerp( a, b, 0.5 );
	assert.ok( Math.abs( result.dotA - result.dotB ) <= Number.EPSILON, 'Symmetry at 0.5' );
	assert.ok( isNormal( result ), 'Approximately normal (at 0.5)' );

	result = doSlerp( a, b, 0.25 );
	assert.ok( result.dotA > result.dotB, 'Interpolating at 0.25' );
	assert.ok( isNormal( result ), 'Approximately normal (at 0.25)' );

	result = doSlerp( a, b, 0.75 );
	assert.ok( result.dotA < result.dotB, 'Interpolating at 0.75' );
	assert.ok( isNormal( result ), 'Approximately normal (at 0.75)' );

	const D = Math.SQRT1_2;

	result = doSlerp( [ 1, 0, 0, 0 ], [ 0, 0, 1, 0 ], 0.5 );
	assert.ok( result.equals( D, 0, D, 0 ), 'X/Z diagonal from axes' );
	assert.ok( isNormal( result ), 'Approximately normal (X/Z diagonal)' );

	result = doSlerp( [ 0, D, 0, D ], [ 0, - D, 0, D ], 0.5 );
	assert.ok( result.equals( 0, 0, 0, 1 ), 'W-Unit from diagonals' );
	assert.ok( isNormal( result ), 'Approximately normal (W-Unit)' );

}

function changeEulerOrder( euler, order ) {

	return new Euler( euler.x, euler.y, euler.z, order );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Quaternion', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Quaternion();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a = new Quaternion( x, y, z, w );
			assert.ok( a.x === x, 'Passed!' );
			assert.ok( a.y === y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );
			assert.ok( a.w === w, 'Passed!' );

		} );

		// STATIC STUFF
		QUnit.test( 'slerp', ( assert ) => {

			slerpTestSkeleton( doSlerpObject, Number.EPSILON, assert );

		} );

		QUnit.test( 'slerpFlat', ( assert ) => {

			slerpTestSkeleton( doSlerpArray, Number.EPSILON, assert );

		} );

		// PROPERTIES
		QUnit.test( 'properties', ( assert ) => {

			assert.expect( 8 );

			const a = new Quaternion();
			a._onChange( function () {

				assert.ok( true, 'onChange called' );

			} );

			a.x = x;
			a.y = y;
			a.z = z;
			a.w = w;

			assert.strictEqual( a.x, x, 'Check x' );
			assert.strictEqual( a.y, y, 'Check y' );
			assert.strictEqual( a.z, z, 'Check z' );
			assert.strictEqual( a.w, w, 'Check w' );

		} );

		QUnit.test( 'x', ( assert ) => {

			let a = new Quaternion();
			assert.ok( a.x === 0, 'Passed!' );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.x === 1, 'Passed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.x === 4, 'Passed!' );

			a = new Quaternion( 7, 8, 9 );
			a.x = 10;
			assert.ok( a.x === 10, 'Passed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, 'Passed!' );
			a.x = 14;
			assert.ok( b, 'Passed!' );
			assert.ok( a.x === 14, 'Passed!' );

		} );

		QUnit.test( 'y', ( assert ) => {

			let a = new Quaternion();
			assert.ok( a.y === 0, 'Passed!' );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.y === 2, 'Passed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.y === 5, 'Passed!' );

			a = new Quaternion( 7, 8, 9 );
			a.y = 10;
			assert.ok( a.y === 10, 'Passed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, 'Passed!' );
			a.y = 14;
			assert.ok( b, 'Passed!' );
			assert.ok( a.y === 14, 'Passed!' );

		} );

		QUnit.test( 'z', ( assert ) => {


			let a = new Quaternion();
			assert.ok( a.z === 0, 'Passed!' );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.z === 3, 'Passed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.z === 6, 'Passed!' );

			a = new Quaternion( 7, 8, 9 );
			a.z = 10;
			assert.ok( a.z === 10, 'Passed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, 'Passed!' );
			a.z = 14;
			assert.ok( b, 'Passed!' );
			assert.ok( a.z === 14, 'Passed!' );

		} );

		QUnit.test( 'w', ( assert ) => {

			let a = new Quaternion();
			assert.ok( a.w === 1, 'Passed!' );

			a = new Quaternion( 1, 2, 3 );
			assert.ok( a.w === 1, 'Passed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			assert.ok( a.w === 1, 'Passed!' );

			a = new Quaternion( 7, 8, 9 );
			a.w = 10;
			assert.ok( a.w === 10, 'Passed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			assert.ok( ! b, 'Passed!' );
			a.w = 14;
			assert.ok( b, 'Passed!' );
			assert.ok( a.w === 14, 'Passed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isQuaternion', ( assert ) => {

			const object = new Quaternion();
			assert.ok( object.isQuaternion, 'Quaternion.isQuaternion should be true' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const a = new Quaternion();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a.set( x, y, z, w );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );
			assert.ok( a.w === w, 'Passed!' );

		} );

		QUnit.test( 'clone', ( assert ) => {


			const a = new Quaternion().clone();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			const b = a.set( x, y, z, w ).clone();
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z === z, 'Passed!' );
			assert.ok( b.w === w, 'Passed!' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion().copy( a );
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z == z, 'Passed!' );
			assert.ok( b.w == w, 'Passed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = 0;
			a.w = - 1;
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );

		} );

		QUnit.test( 'setFromEuler/setFromQuaternion', ( assert ) => {

			const angles = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];

			// ensure euler conversion to/from Quaternion matches.
			for ( let i = 0; i < orders.length; i ++ ) {

				for ( let j = 0; j < angles.length; j ++ ) {

					const eulers2 = new Euler().setFromQuaternion( new Quaternion().setFromEuler( new Euler( angles[ j ].x, angles[ j ].y, angles[ j ].z, orders[ i ] ) ), orders[ i ] );
					const newAngle = new Vector3( eulers2.x, eulers2.y, eulers2.z );
					assert.ok( newAngle.distanceTo( angles[ j ] ) < 0.001, 'Passed!' );

				}

			}

		} );

		QUnit.test( 'setFromAxisAngle', ( assert ) => {

			// TODO: find cases to validate.
			// assert.ok( true, "Passed!" );

			const zero = new Quaternion();

			let a = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), 0 );
			assert.ok( a.equals( zero ), 'Passed!' );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), 0 );
			assert.ok( a.equals( zero ), 'Passed!' );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 0, 1 ), 0 );
			assert.ok( a.equals( zero ), 'Passed!' );

			const b1 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), Math.PI );
			assert.ok( ! a.equals( b1 ), 'Passed!' );
			const b2 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), - Math.PI );
			assert.ok( ! a.equals( b2 ), 'Passed!' );

			b1.multiply( b2 );
			assert.ok( a.equals( b1 ), 'Passed!' );

		} );

		QUnit.test( 'setFromEuler/setFromRotationMatrix', ( assert ) => {

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( let i = 0; i < orders.length; i ++ ) {

				const q = new Quaternion().setFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				const m = new Matrix4().makeRotationFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				const q2 = new Quaternion().setFromRotationMatrix( m );

				assert.ok( qSub( q, q2 ).length() < 0.001, 'Passed!' );

			}

		} );

		QUnit.test( 'setFromRotationMatrix', ( assert ) => {

			// contrived examples purely to please the god of code coverage...
			// match conditions in various 'else [if]' blocks

			const a = new Quaternion();
			let q = new Quaternion( - 9, - 2, 3, - 4 ).normalize();
			const m = new Matrix4().makeRotationFromQuaternion( q );
			let expected = new Vector4( 0.8581163303210332, 0.19069251784911848, - 0.2860387767736777, 0.38138503569823695 );

			a.setFromRotationMatrix( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'm11 > m22 && m11 > m33: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'm11 > m22 && m11 > m33: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'm11 > m22 && m11 > m33: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'm11 > m22 && m11 > m33: check w' );

			q = new Quaternion( - 1, - 2, 1, - 1 ).normalize();
			m.makeRotationFromQuaternion( q );
			expected = new Vector4( 0.37796447300922714, 0.7559289460184544, - 0.37796447300922714, 0.37796447300922714 );

			a.setFromRotationMatrix( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'm22 > m33: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'm22 > m33: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'm22 > m33: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'm22 > m33: check w' );

		} );

		QUnit.test( 'setFromUnitVectors', ( assert ) => {

			const a = new Quaternion();
			const b = new Vector3( 1, 0, 0 );
			const c = new Vector3( 0, 1, 0 );
			const expected = new Quaternion( 0, 0, Math.sqrt( 2 ) / 2, Math.sqrt( 2 ) / 2 );

			a.setFromUnitVectors( b, c );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'angleTo', ( assert ) => {

			const a = new Quaternion();
			const b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			const c = new Quaternion().setFromEuler( new Euler( 0, Math.PI * 2, 0 ) );

			assert.ok( a.angleTo( a ) === 0, 'Passed!' );
			assert.ok( a.angleTo( b ) === Math.PI, 'Passed!' );
			assert.ok( a.angleTo( c ) === 0, 'Passed!' );

		} );

		QUnit.test( 'rotateTowards', ( assert ) => {

			const a = new Quaternion();
			const b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			const c = new Quaternion();

			const halfPI = Math.PI * 0.5;

			a.rotateTowards( b, 0 );
			assert.ok( a.equals( a ) === true, 'Passed!' );

			a.rotateTowards( b, Math.PI * 2 ); // test overshoot
			assert.ok( a.equals( b ) === true, 'Passed!' );

			a.set( 0, 0, 0, 1 );
			a.rotateTowards( b, halfPI );
			assert.ok( a.angleTo( c ) - halfPI <= eps, 'Passed!' );

		} );

		QUnit.test( 'identity', ( assert ) => {

			const a = new Quaternion();

			a.set( x, y, z, w );
			a.identity();

			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z === 0, 'Passed!' );
			assert.ok( a.w === 1, 'Passed!' );

		} );

		QUnit.test( 'invert/conjugate', ( assert ) => {

			const a = new Quaternion( x, y, z, w );

			// TODO: add better validation here.

			const b = a.clone().conjugate();

			assert.ok( a.x == - b.x, 'Passed!' );
			assert.ok( a.y == - b.y, 'Passed!' );
			assert.ok( a.z == - b.z, 'Passed!' );
			assert.ok( a.w == b.w, 'Passed!' );

		} );

		QUnit.test( 'dot', ( assert ) => {

			let a = new Quaternion();
			let b = new Quaternion();

			assert.ok( a.dot( b ) === 1, 'Passed!' );
			a = new Quaternion( 1, 2, 3, 1 );
			b = new Quaternion( 3, 2, 1, 1 );

			assert.ok( a.dot( b ) === 11, 'Passed!' );


		} );

		QUnit.test( 'normalize/length/lengthSq', ( assert ) => {

			const a = new Quaternion( x, y, z, w );

			assert.ok( a.length() != 1, 'Passed!' );
			assert.ok( a.lengthSq() != 1, 'Passed!' );
			a.normalize();
			assert.ok( a.length() == 1, 'Passed!' );
			assert.ok( a.lengthSq() == 1, 'Passed!' );

			a.set( 0, 0, 0, 0 );
			assert.ok( a.lengthSq() == 0, 'Passed!' );
			assert.ok( a.length() == 0, 'Passed!' );
			a.normalize();
			assert.ok( a.lengthSq() == 1, 'Passed!' );
			assert.ok( a.length() == 1, 'Passed!' );

		} );

		QUnit.test( 'multiplyQuaternions/multiply', ( assert ) => {

			const angles = [ new Euler( 1, 0, 0 ), new Euler( 0, 1, 0 ), new Euler( 0, 0, 1 ) ];

			const q1 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 0 ], 'XYZ' ) );
			const q2 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 1 ], 'XYZ' ) );
			const q3 = new Quaternion().setFromEuler( changeEulerOrder( angles[ 2 ], 'XYZ' ) );

			const q = new Quaternion().multiplyQuaternions( q1, q2 ).multiply( q3 );

			const m1 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 0 ], 'XYZ' ) );
			const m2 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 1 ], 'XYZ' ) );
			const m3 = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ 2 ], 'XYZ' ) );

			const m = new Matrix4().multiplyMatrices( m1, m2 ).multiply( m3 );

			const qFromM = new Quaternion().setFromRotationMatrix( m );

			assert.ok( qSub( q, qFromM ).length() < 0.001, 'Passed!' );

		} );

		QUnit.test( 'premultiply', ( assert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( 2 * x, - y, - 2 * z, w );
			const expected = new Quaternion( 42, - 32, - 2, 58 );

			a.premultiply( b );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'slerp', ( assert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( - x, - y, - z, - w );

			const c = a.clone().slerp( b, 0 );
			const d = a.clone().slerp( b, 1 );

			assert.ok( a.equals( c ), 'Passed' );
			assert.ok( b.equals( d ), 'Passed' );


			const D = Math.SQRT1_2;

			const e = new Quaternion( 1, 0, 0, 0 );
			const f = new Quaternion( 0, 0, 1, 0 );
			let expected = new Quaternion( D, 0, D, 0 );
			let result = e.clone().slerp( f, 0.5 );
			assert.ok( Math.abs( result.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( result.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( result.z - expected.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( result.w - expected.w ) <= eps, 'Check w' );


			const g = new Quaternion( 0, D, 0, D );
			const h = new Quaternion( 0, - D, 0, D );
			expected = new Quaternion( 0, 0, 0, 1 );
			result = g.clone().slerp( h, 0.5 );

			assert.ok( Math.abs( result.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( result.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( result.z - expected.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( result.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'slerpQuaternions', ( assert ) => {

			const e = new Quaternion( 1, 0, 0, 0 );
			const f = new Quaternion( 0, 0, 1, 0 );
			const expected = new Quaternion( Math.SQRT1_2, 0, Math.SQRT1_2, 0 );

			const a = new Quaternion();
			a.slerpQuaternions( e, f, 0.5 );

			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'random', ( assert ) => {

			const a = new Quaternion();

			a.random();

			const identity = new Quaternion();
			assert.notDeepEqual(
				a,
				identity,
				'randomizes at least one component of the quaternion'
			);

			assert.ok( ( 1 - a.length() ) <= Number.EPSILON, 'produces a normalized quaternion' );

		} );

		QUnit.test( 'equals', ( assert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( - x, - y, - z, - w );

			assert.ok( a.x != b.x, 'Passed!' );
			assert.ok( a.y != b.y, 'Passed!' );

			assert.ok( ! a.equals( b ), 'Passed!' );
			assert.ok( ! b.equals( a ), 'Passed!' );

			a.copy( b );
			assert.ok( a.x == b.x, 'Passed!' );
			assert.ok( a.y == b.y, 'Passed!' );

			assert.ok( a.equals( b ), 'Passed!' );
			assert.ok( b.equals( a ), 'Passed!' );

		} );

		QUnit.test( 'fromArray', ( assert ) => {

			const a = new Quaternion();
			a.fromArray( [ x, y, z, w ] );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );
			assert.ok( a.w === w, 'Passed!' );

			a.fromArray( [ undefined, x, y, z, w, undefined ], 1 );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );
			assert.ok( a.w === w, 'Passed!' );

		} );

		QUnit.test( 'toArray', ( assert ) => {

			const a = new Quaternion( x, y, z, w );

			let array = a.toArray();
			assert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );
			assert.strictEqual( array[ 3 ], w, 'No array, no offset: check w' );

			array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );
			assert.strictEqual( array[ 3 ], w, 'With array, no offset: check w' );

			array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			assert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			assert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			assert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );
			assert.strictEqual( array[ 4 ], w, 'With array and offset: check w' );

		} );

		QUnit.test( 'fromBufferAttribute', ( assert ) => {

			const a = new Quaternion();

			const attribute = new BufferAttribute( new Float32Array( [

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

		QUnit.test( '_onChange', ( assert ) => {

			let b = false;
			const f = function () {

				b = true;

			};

			const a = new Quaternion( 11, 12, 13, 1 );
			a._onChange( f );
			assert.ok( a._onChangeCallback === f, 'Passed!' );

			a._onChangeCallback();
			assert.ok( b, 'Passed!' );


		} );

		QUnit.test( '_onChangeCallback', ( assert ) => {

			let b = false;
			const a = new Quaternion( 11, 12, 13, 1 );
			const f = function () {

				b = true;
				assert.ok( a === this, 'Passed!' );

			};

			a._onChangeCallback = f;
			assert.ok( a._onChangeCallback === f, 'Passed!' );


			a._onChangeCallback();
			assert.ok( b, 'Passed!' );

		} );

		// OTHERS
		QUnit.test( 'multiplyVector3', ( assert ) => {

			const angles = [ new Euler( 1, 0, 0 ), new Euler( 0, 1, 0 ), new Euler( 0, 0, 1 ) ];

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( let i = 0; i < orders.length; i ++ ) {

				for ( let j = 0; j < angles.length; j ++ ) {

					const q = new Quaternion().setFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );
					const m = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );

					const v0 = new Vector3( 1, 0, 0 );
					const qv = v0.clone().applyQuaternion( q );
					const mv = v0.clone().applyMatrix4( m );

					assert.ok( qv.distanceTo( mv ) < 0.001, 'Passed!' );

				}

			}

		} );

		QUnit.test( 'toJSON', ( assert ) => {

			const q = new Quaternion( 0, 0.5, 0.7, 1 );
			const array = q.toJSON();
			assert.strictEqual( array[ 0 ], 0, 'Quaternion is serializable.' );
			assert.strictEqual( array[ 1 ], 0.5, 'Quaternion is serializable.' );
			assert.strictEqual( array[ 2 ], 0.7, 'Quaternion is serializable.' );
			assert.strictEqual( array[ 3 ], 1, 'Quaternion is serializable.' );

		} );

		QUnit.test( 'iterable', ( assert ) => {

			const q = new Quaternion( 0, 0.5, 0.7, 1 );
			const array = [ ...q ];
			assert.strictEqual( array[ 0 ], 0, 'Quaternion is iterable.' );
			assert.strictEqual( array[ 1 ], 0.5, 'Quaternion is iterable.' );
			assert.strictEqual( array[ 2 ], 0.7, 'Quaternion is iterable.' );
			assert.strictEqual( array[ 3 ], 1, 'Quaternion is iterable.' );

		} );

	} );

} );
