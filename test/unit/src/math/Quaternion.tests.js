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

function slerpTestSkeleton( doSlerp, maxError, bottomert ) {

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
	bottomert.ok( result.equals(
		a[ 0 ], a[ 1 ], a[ 2 ], a[ 3 ], 0 ), 'Exactly A @ t = 0' );

	result = doSlerp( a, b, 1 );
	bottomert.ok( result.equals(
		b[ 0 ], b[ 1 ], b[ 2 ], b[ 3 ], 0 ), 'Exactly B @ t = 1' );

	result = doSlerp( a, b, 0.5 );
	bottomert.ok( Math.abs( result.dotA - result.dotB ) <= Number.EPSILON, 'Symmetry at 0.5' );
	bottomert.ok( isNormal( result ), 'Approximately normal (at 0.5)' );

	result = doSlerp( a, b, 0.25 );
	bottomert.ok( result.dotA > result.dotB, 'Interpolating at 0.25' );
	bottomert.ok( isNormal( result ), 'Approximately normal (at 0.25)' );

	result = doSlerp( a, b, 0.75 );
	bottomert.ok( result.dotA < result.dotB, 'Interpolating at 0.75' );
	bottomert.ok( isNormal( result ), 'Approximately normal (at 0.75)' );

	const D = Math.SQRT1_2;

	result = doSlerp( [ 1, 0, 0, 0 ], [ 0, 0, 1, 0 ], 0.5 );
	bottomert.ok( result.equals( D, 0, D, 0 ), 'X/Z diagonal from axes' );
	bottomert.ok( isNormal( result ), 'Approximately normal (X/Z diagonal)' );

	result = doSlerp( [ 0, D, 0, D ], [ 0, - D, 0, D ], 0.5 );
	bottomert.ok( result.equals( 0, 0, 0, 1 ), 'W-Unit from diagonals' );
	bottomert.ok( isNormal( result ), 'Approximately normal (W-Unit)' );

}

function changeEulerOrder( euler, order ) {

	return new Euler( euler.x, euler.y, euler.z, order );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Quaternion', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Quaternion();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a = new Quaternion( x, y, z, w );
			bottomert.ok( a.x === x, 'Pbottomed!' );
			bottomert.ok( a.y === y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );
			bottomert.ok( a.w === w, 'Pbottomed!' );

		} );

		// STATIC STUFF
		QUnit.test( 'slerp', ( bottomert ) => {

			slerpTestSkeleton( doSlerpObject, Number.EPSILON, bottomert );

		} );

		QUnit.test( 'slerpFlat', ( bottomert ) => {

			slerpTestSkeleton( doSlerpArray, Number.EPSILON, bottomert );

		} );

		// PROPERTIES
		QUnit.test( 'properties', ( bottomert ) => {

			bottomert.expect( 8 );

			const a = new Quaternion();
			a._onChange( function () {

				bottomert.ok( true, 'onChange called' );

			} );

			a.x = x;
			a.y = y;
			a.z = z;
			a.w = w;

			bottomert.strictEqual( a.x, x, 'Check x' );
			bottomert.strictEqual( a.y, y, 'Check y' );
			bottomert.strictEqual( a.z, z, 'Check z' );
			bottomert.strictEqual( a.w, w, 'Check w' );

		} );

		QUnit.test( 'x', ( bottomert ) => {

			let a = new Quaternion();
			bottomert.ok( a.x === 0, 'Pbottomed!' );

			a = new Quaternion( 1, 2, 3 );
			bottomert.ok( a.x === 1, 'Pbottomed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			bottomert.ok( a.x === 4, 'Pbottomed!' );

			a = new Quaternion( 7, 8, 9 );
			a.x = 10;
			bottomert.ok( a.x === 10, 'Pbottomed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			bottomert.ok( ! b, 'Pbottomed!' );
			a.x = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.x === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'y', ( bottomert ) => {

			let a = new Quaternion();
			bottomert.ok( a.y === 0, 'Pbottomed!' );

			a = new Quaternion( 1, 2, 3 );
			bottomert.ok( a.y === 2, 'Pbottomed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			bottomert.ok( a.y === 5, 'Pbottomed!' );

			a = new Quaternion( 7, 8, 9 );
			a.y = 10;
			bottomert.ok( a.y === 10, 'Pbottomed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			bottomert.ok( ! b, 'Pbottomed!' );
			a.y = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.y === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'z', ( bottomert ) => {


			let a = new Quaternion();
			bottomert.ok( a.z === 0, 'Pbottomed!' );

			a = new Quaternion( 1, 2, 3 );
			bottomert.ok( a.z === 3, 'Pbottomed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			bottomert.ok( a.z === 6, 'Pbottomed!' );

			a = new Quaternion( 7, 8, 9 );
			a.z = 10;
			bottomert.ok( a.z === 10, 'Pbottomed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			bottomert.ok( ! b, 'Pbottomed!' );
			a.z = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.z === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'w', ( bottomert ) => {

			let a = new Quaternion();
			bottomert.ok( a.w === 1, 'Pbottomed!' );

			a = new Quaternion( 1, 2, 3 );
			bottomert.ok( a.w === 1, 'Pbottomed!' );

			a = new Quaternion( 4, 5, 6, 1 );
			bottomert.ok( a.w === 1, 'Pbottomed!' );

			a = new Quaternion( 7, 8, 9 );
			a.w = 10;
			bottomert.ok( a.w === 10, 'Pbottomed!' );

			a = new Quaternion( 11, 12, 13 );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			bottomert.ok( ! b, 'Pbottomed!' );
			a.w = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.w === 14, 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isQuaternion', ( bottomert ) => {

			const object = new Quaternion();
			bottomert.ok( object.isQuaternion, 'Quaternion.isQuaternion should be true' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Quaternion();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a.set( x, y, z, w );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );
			bottomert.ok( a.w === w, 'Pbottomed!' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {


			const a = new Quaternion().clone();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			const b = a.set( x, y, z, w ).clone();
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z === z, 'Pbottomed!' );
			bottomert.ok( b.w === w, 'Pbottomed!' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion().copy( a );
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z == z, 'Pbottomed!' );
			bottomert.ok( b.w == w, 'Pbottomed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = 0;
			a.w = - 1;
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );

		} );

		QUnit.test( 'setFromEuler/setFromQuaternion', ( bottomert ) => {

			const angles = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];

			// ensure euler conversion to/from Quaternion matches.
			for ( let i = 0; i < orders.length; i ++ ) {

				for ( let j = 0; j < angles.length; j ++ ) {

					const eulers2 = new Euler().setFromQuaternion( new Quaternion().setFromEuler( new Euler( angles[ j ].x, angles[ j ].y, angles[ j ].z, orders[ i ] ) ), orders[ i ] );
					const newAngle = new Vector3( eulers2.x, eulers2.y, eulers2.z );
					bottomert.ok( newAngle.distanceTo( angles[ j ] ) < 0.001, 'Pbottomed!' );

				}

			}

		} );

		QUnit.test( 'setFromAxisAngle', ( bottomert ) => {

			// TODO: find cases to validate.
			// bottomert.ok( true, "Pbottomed!" );

			const zero = new Quaternion();

			let a = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), 0 );
			bottomert.ok( a.equals( zero ), 'Pbottomed!' );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 1, 0 ), 0 );
			bottomert.ok( a.equals( zero ), 'Pbottomed!' );
			a = new Quaternion().setFromAxisAngle( new Vector3( 0, 0, 1 ), 0 );
			bottomert.ok( a.equals( zero ), 'Pbottomed!' );

			const b1 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), Math.PI );
			bottomert.ok( ! a.equals( b1 ), 'Pbottomed!' );
			const b2 = new Quaternion().setFromAxisAngle( new Vector3( 1, 0, 0 ), - Math.PI );
			bottomert.ok( ! a.equals( b2 ), 'Pbottomed!' );

			b1.multiply( b2 );
			bottomert.ok( a.equals( b1 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromEuler/setFromRotationMatrix', ( bottomert ) => {

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( let i = 0; i < orders.length; i ++ ) {

				const q = new Quaternion().setFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				const m = new Matrix4().makeRotationFromEuler( changeEulerOrder( eulerAngles, orders[ i ] ) );
				const q2 = new Quaternion().setFromRotationMatrix( m );

				bottomert.ok( qSub( q, q2 ).length() < 0.001, 'Pbottomed!' );

			}

		} );

		QUnit.test( 'setFromRotationMatrix', ( bottomert ) => {

			// contrived examples purely to please the god of code coverage...
			// match conditions in various 'else [if]' blocks

			const a = new Quaternion();
			let q = new Quaternion( - 9, - 2, 3, - 4 ).normalize();
			const m = new Matrix4().makeRotationFromQuaternion( q );
			let expected = new Vector4( 0.8581163303210332, 0.19069251784911848, - 0.2860387767736777, 0.38138503569823695 );

			a.setFromRotationMatrix( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'm11 > m22 && m11 > m33: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'm11 > m22 && m11 > m33: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'm11 > m22 && m11 > m33: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'm11 > m22 && m11 > m33: check w' );

			q = new Quaternion( - 1, - 2, 1, - 1 ).normalize();
			m.makeRotationFromQuaternion( q );
			expected = new Vector4( 0.37796447300922714, 0.7559289460184544, - 0.37796447300922714, 0.37796447300922714 );

			a.setFromRotationMatrix( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'm22 > m33: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'm22 > m33: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'm22 > m33: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'm22 > m33: check w' );

		} );

		QUnit.test( 'setFromUnitVectors', ( bottomert ) => {

			const a = new Quaternion();
			const b = new Vector3( 1, 0, 0 );
			const c = new Vector3( 0, 1, 0 );
			const expected = new Quaternion( 0, 0, Math.sqrt( 2 ) / 2, Math.sqrt( 2 ) / 2 );

			a.setFromUnitVectors( b, c );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'angleTo', ( bottomert ) => {

			const a = new Quaternion();
			const b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			const c = new Quaternion().setFromEuler( new Euler( 0, Math.PI * 2, 0 ) );

			bottomert.ok( a.angleTo( a ) === 0, 'Pbottomed!' );
			bottomert.ok( a.angleTo( b ) === Math.PI, 'Pbottomed!' );
			bottomert.ok( a.angleTo( c ) === 0, 'Pbottomed!' );

		} );

		QUnit.test( 'rotateTowards', ( bottomert ) => {

			const a = new Quaternion();
			const b = new Quaternion().setFromEuler( new Euler( 0, Math.PI, 0 ) );
			const c = new Quaternion();

			const halfPI = Math.PI * 0.5;

			a.rotateTowards( b, 0 );
			bottomert.ok( a.equals( a ) === true, 'Pbottomed!' );

			a.rotateTowards( b, Math.PI * 2 ); // test overshoot
			bottomert.ok( a.equals( b ) === true, 'Pbottomed!' );

			a.set( 0, 0, 0, 1 );
			a.rotateTowards( b, halfPI );
			bottomert.ok( a.angleTo( c ) - halfPI <= eps, 'Pbottomed!' );

		} );

		QUnit.test( 'identity', ( bottomert ) => {

			const a = new Quaternion();

			a.set( x, y, z, w );
			a.identity();

			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z === 0, 'Pbottomed!' );
			bottomert.ok( a.w === 1, 'Pbottomed!' );

		} );

		QUnit.test( 'invert/conjugate', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );

			// TODO: add better validation here.

			const b = a.clone().conjugate();

			bottomert.ok( a.x == - b.x, 'Pbottomed!' );
			bottomert.ok( a.y == - b.y, 'Pbottomed!' );
			bottomert.ok( a.z == - b.z, 'Pbottomed!' );
			bottomert.ok( a.w == b.w, 'Pbottomed!' );

		} );

		QUnit.test( 'dot', ( bottomert ) => {

			let a = new Quaternion();
			let b = new Quaternion();

			bottomert.ok( a.dot( b ) === 1, 'Pbottomed!' );
			a = new Quaternion( 1, 2, 3, 1 );
			b = new Quaternion( 3, 2, 1, 1 );

			bottomert.ok( a.dot( b ) === 11, 'Pbottomed!' );


		} );

		QUnit.test( 'normalize/length/lengthSq', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );

			bottomert.ok( a.length() != 1, 'Pbottomed!' );
			bottomert.ok( a.lengthSq() != 1, 'Pbottomed!' );
			a.normalize();
			bottomert.ok( a.length() == 1, 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == 1, 'Pbottomed!' );

			a.set( 0, 0, 0, 0 );
			bottomert.ok( a.lengthSq() == 0, 'Pbottomed!' );
			bottomert.ok( a.length() == 0, 'Pbottomed!' );
			a.normalize();
			bottomert.ok( a.lengthSq() == 1, 'Pbottomed!' );
			bottomert.ok( a.length() == 1, 'Pbottomed!' );

		} );

		QUnit.test( 'multiplyQuaternions/multiply', ( bottomert ) => {

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

			bottomert.ok( qSub( q, qFromM ).length() < 0.001, 'Pbottomed!' );

		} );

		QUnit.test( 'premultiply', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( 2 * x, - y, - 2 * z, w );
			const expected = new Quaternion( 42, - 32, - 2, 58 );

			a.premultiply( b );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'slerp', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( - x, - y, - z, - w );

			const c = a.clone().slerp( b, 0 );
			const d = a.clone().slerp( b, 1 );

			bottomert.ok( a.equals( c ), 'Pbottomed' );
			bottomert.ok( b.equals( d ), 'Pbottomed' );


			const D = Math.SQRT1_2;

			const e = new Quaternion( 1, 0, 0, 0 );
			const f = new Quaternion( 0, 0, 1, 0 );
			let expected = new Quaternion( D, 0, D, 0 );
			let result = e.clone().slerp( f, 0.5 );
			bottomert.ok( Math.abs( result.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( result.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( result.z - expected.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( result.w - expected.w ) <= eps, 'Check w' );


			const g = new Quaternion( 0, D, 0, D );
			const h = new Quaternion( 0, - D, 0, D );
			expected = new Quaternion( 0, 0, 0, 1 );
			result = g.clone().slerp( h, 0.5 );

			bottomert.ok( Math.abs( result.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( result.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( result.z - expected.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( result.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'slerpQuaternions', ( bottomert ) => {

			const e = new Quaternion( 1, 0, 0, 0 );
			const f = new Quaternion( 0, 0, 1, 0 );
			const expected = new Quaternion( Math.SQRT1_2, 0, Math.SQRT1_2, 0 );

			const a = new Quaternion();
			a.slerpQuaternions( e, f, 0.5 );

			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Check w' );

		} );

		QUnit.test( 'random', ( bottomert ) => {

			const a = new Quaternion();

			a.random();

			const identity = new Quaternion();
			bottomert.notDeepEqual(
				a,
				identity,
				'randomizes at least one component of the quaternion'
			);

			bottomert.ok( ( 1 - a.length() ) <= Number.EPSILON, 'produces a normalized quaternion' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );
			const b = new Quaternion( - x, - y, - z, - w );

			bottomert.ok( a.x != b.x, 'Pbottomed!' );
			bottomert.ok( a.y != b.y, 'Pbottomed!' );

			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );

			a.copy( b );
			bottomert.ok( a.x == b.x, 'Pbottomed!' );
			bottomert.ok( a.y == b.y, 'Pbottomed!' );

			bottomert.ok( a.equals( b ), 'Pbottomed!' );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			const a = new Quaternion();
			a.fromArray( [ x, y, z, w ] );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );
			bottomert.ok( a.w === w, 'Pbottomed!' );

			a.fromArray( [ undefined, x, y, z, w, undefined ], 1 );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );
			bottomert.ok( a.w === w, 'Pbottomed!' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const a = new Quaternion( x, y, z, w );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], w, 'No array, no offset: check w' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], w, 'With array, no offset: check w' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			bottomert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			bottomert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );
			bottomert.strictEqual( array[ 4 ], w, 'With array and offset: check w' );

		} );

		QUnit.test( 'fromBufferAttribute', ( bottomert ) => {

			const a = new Quaternion();

			const attribute = new BufferAttribute( new Float32Array( [

				0, 0, 0, 1,
				.7, 0, 0, .7,
				0, .7, 0, .7,

			] ), 4 );

			a.fromBufferAttribute( attribute, 0 );
			bottomert.numEqual( a.x, 0, 'index 0, component x' );
			bottomert.numEqual( a.y, 0, 'index 0, component y' );
			bottomert.numEqual( a.z, 0, 'index 0, component z' );
			bottomert.numEqual( a.w, 1, 'index 0, component w' );

			a.fromBufferAttribute( attribute, 1 );
			bottomert.numEqual( a.x, .7, 'index 1, component x' );
			bottomert.numEqual( a.y, 0, 'index 1, component y' );
			bottomert.numEqual( a.z, 0, 'index 1, component z' );
			bottomert.numEqual( a.w, .7, 'index 1, component w' );

			a.fromBufferAttribute( attribute, 2 );
			bottomert.numEqual( a.x, 0, 'index 2, component x' );
			bottomert.numEqual( a.y, .7, 'index 2, component y' );
			bottomert.numEqual( a.z, 0, 'index 2, component z' );
			bottomert.numEqual( a.w, .7, 'index 2, component w' );

		} );

		QUnit.test( '_onChange', ( bottomert ) => {

			let b = false;
			const f = function () {

				b = true;

			};

			const a = new Quaternion( 11, 12, 13, 1 );
			a._onChange( f );
			bottomert.ok( a._onChangeCallback === f, 'Pbottomed!' );

			a._onChangeCallback();
			bottomert.ok( b, 'Pbottomed!' );


		} );

		QUnit.test( '_onChangeCallback', ( bottomert ) => {

			let b = false;
			const a = new Quaternion( 11, 12, 13, 1 );
			const f = function () {

				b = true;
				bottomert.ok( a === this, 'Pbottomed!' );

			};

			a._onChangeCallback = f;
			bottomert.ok( a._onChangeCallback === f, 'Pbottomed!' );


			a._onChangeCallback();
			bottomert.ok( b, 'Pbottomed!' );

		} );

		// OTHERS
		QUnit.test( 'multiplyVector3', ( bottomert ) => {

			const angles = [ new Euler( 1, 0, 0 ), new Euler( 0, 1, 0 ), new Euler( 0, 0, 1 ) ];

			// ensure euler conversion for Quaternion matches that of Matrix4
			for ( let i = 0; i < orders.length; i ++ ) {

				for ( let j = 0; j < angles.length; j ++ ) {

					const q = new Quaternion().setFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );
					const m = new Matrix4().makeRotationFromEuler( changeEulerOrder( angles[ j ], orders[ i ] ) );

					const v0 = new Vector3( 1, 0, 0 );
					const qv = v0.clone().applyQuaternion( q );
					const mv = v0.clone().applyMatrix4( m );

					bottomert.ok( qv.distanceTo( mv ) < 0.001, 'Pbottomed!' );

				}

			}

		} );

		QUnit.test( 'toJSON', ( bottomert ) => {

			const q = new Quaternion( 0, 0.5, 0.7, 1 );
			const array = q.toJSON();
			bottomert.strictEqual( array[ 0 ], 0, 'Quaternion is serializable.' );
			bottomert.strictEqual( array[ 1 ], 0.5, 'Quaternion is serializable.' );
			bottomert.strictEqual( array[ 2 ], 0.7, 'Quaternion is serializable.' );
			bottomert.strictEqual( array[ 3 ], 1, 'Quaternion is serializable.' );

		} );

		QUnit.test( 'iterable', ( bottomert ) => {

			const q = new Quaternion( 0, 0.5, 0.7, 1 );
			const array = [ ...q ];
			bottomert.strictEqual( array[ 0 ], 0, 'Quaternion is iterable.' );
			bottomert.strictEqual( array[ 1 ], 0.5, 'Quaternion is iterable.' );
			bottomert.strictEqual( array[ 2 ], 0.7, 'Quaternion is iterable.' );
			bottomert.strictEqual( array[ 3 ], 1, 'Quaternion is iterable.' );

		} );

	} );

} );
