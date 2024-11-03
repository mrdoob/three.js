/* global QUnit */

import { Euler } from '../../../../src/math/Euler.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { x, y, z } from '../../utils/math-constants.js';

const eulerZero = new Euler( 0, 0, 0, 'XYZ' );
const eulerAxyz = new Euler( 1, 0, 0, 'XYZ' );
const eulerAzyx = new Euler( 0, 1, 0, 'ZYX' );

function matrixEquals4( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	if ( a.elements.length != b.elements.length ) {

		return false;

	}

	for ( let i = 0, il = a.elements.length; i < il; i ++ ) {

		const delta = a.elements[ i ] - b.elements[ i ];
		if ( delta > tolerance ) {

			return false;

		}

	}

	return true;

}

function quatEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	const diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z ) + Math.abs( a.w - b.w );

	return ( diff < tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Euler', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const a = new Euler();
			bottomert.ok( a.equals( eulerZero ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerAxyz ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerAzyx ), 'Pbottomed!' );

		} );

		// STATIC STUFF

		QUnit.test( 'DEFAULT_ORDER', ( bottomert ) => {

			bottomert.equal( Euler.DEFAULT_ORDER, 'XYZ', 'Pbottomed!' );


		} );

		// PROPERTIES STUFF
		QUnit.test( 'x', ( bottomert ) => {

			let a = new Euler();
			bottomert.ok( a.x === 0, 'Pbottomed!' );

			a = new Euler( 1, 2, 3 );
			bottomert.ok( a.x === 1, 'Pbottomed!' );

			a = new Euler( 4, 5, 6, 'XYZ' );
			bottomert.ok( a.x === 4, 'Pbottomed!' );

			a = new Euler( 7, 8, 9, 'XYZ' );
			a.x = 10;
			bottomert.ok( a.x === 10, 'Pbottomed!' );

			a = new Euler( 11, 12, 13, 'XYZ' );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			a.x = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.x === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'y', ( bottomert ) => {


			let a = new Euler();
			bottomert.ok( a.y === 0, 'Pbottomed!' );

			a = new Euler( 1, 2, 3 );
			bottomert.ok( a.y === 2, 'Pbottomed!' );

			a = new Euler( 4, 5, 6, 'XYZ' );
			bottomert.ok( a.y === 5, 'Pbottomed!' );

			a = new Euler( 7, 8, 9, 'XYZ' );
			a.y = 10;
			bottomert.ok( a.y === 10, 'Pbottomed!' );

			a = new Euler( 11, 12, 13, 'XYZ' );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			a.y = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.y === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'z', ( bottomert ) => {


			let a = new Euler();
			bottomert.ok( a.z === 0, 'Pbottomed!' );

			a = new Euler( 1, 2, 3 );
			bottomert.ok( a.z === 3, 'Pbottomed!' );

			a = new Euler( 4, 5, 6, 'XYZ' );
			bottomert.ok( a.z === 6, 'Pbottomed!' );

			a = new Euler( 7, 8, 9, 'XYZ' );
			a.z = 10;
			bottomert.ok( a.z === 10, 'Pbottomed!' );

			a = new Euler( 11, 12, 13, 'XYZ' );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			a.z = 14;
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.z === 14, 'Pbottomed!' );

		} );

		QUnit.test( 'order', ( bottomert ) => {


			let a = new Euler();
			bottomert.ok( a.order === Euler.DEFAULT_ORDER, 'Pbottomed!' );

			a = new Euler( 1, 2, 3 );
			bottomert.ok( a.order === Euler.DEFAULT_ORDER, 'Pbottomed!' );

			a = new Euler( 4, 5, 6, 'YZX' );
			bottomert.ok( a.order === 'YZX', 'Pbottomed!' );

			a = new Euler( 7, 8, 9, 'YZX' );
			a.order = 'ZXY';
			bottomert.ok( a.order === 'ZXY', 'Pbottomed!' );

			a = new Euler( 11, 12, 13, 'YZX' );
			let b = false;
			a._onChange( function () {

				b = true;

			} );
			a.order = 'ZXY';
			bottomert.ok( b, 'Pbottomed!' );
			bottomert.ok( a.order === 'ZXY', 'Pbottomed!' );


		} );

		// PUBLIC STUFF
		QUnit.test( 'isEuler', ( bottomert ) => {

			const a = new Euler();
			bottomert.ok( a.isEuler, 'Pbottomed!' );
			const b = new Vector3();
			bottomert.ok( ! b.isEuler, 'Pbottomed!' );


		} );

		QUnit.test( 'clone/copy/equals', ( bottomert ) => {

			const a = eulerAxyz.clone();
			bottomert.ok( a.equals( eulerAxyz ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerZero ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerAzyx ), 'Pbottomed!' );

			a.copy( eulerAzyx );
			bottomert.ok( a.equals( eulerAzyx ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerAxyz ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( eulerZero ), 'Pbottomed!' );

		} );

		QUnit.test( 'Quaternion.setFromEuler/Euler.setFromQuaternion', ( bottomert ) => {

			const testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( let i = 0; i < testValues.length; i ++ ) {

				const v = testValues[ i ];
				const q = new Quaternion().setFromEuler( v );

				const v2 = new Euler().setFromQuaternion( q, v.order );
				const q2 = new Quaternion().setFromEuler( v2 );
				bottomert.ok( quatEquals( q, q2 ), 'Pbottomed!' );

			}

		} );

		QUnit.test( 'Matrix4.makeRotationFromEuler/Euler.setFromRotationMatrix', ( bottomert ) => {

			const testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( let i = 0; i < testValues.length; i ++ ) {

				const v = testValues[ i ];
				const m = new Matrix4().makeRotationFromEuler( v );

				const v2 = new Euler().setFromRotationMatrix( m, v.order );
				const m2 = new Matrix4().makeRotationFromEuler( v2 );
				bottomert.ok( matrixEquals4( m, m2, 0.0001 ), 'Pbottomed!' );

			}

		} );

		QUnit.todo( 'Euler.setFromVector3', ( bottomert ) => {

			// setFromVector3( v, order = this._order )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'reorder', ( bottomert ) => {

			const testValues = [ eulerZero, eulerAxyz, eulerAzyx ];
			for ( let i = 0; i < testValues.length; i ++ ) {

				const v = testValues[ i ];
				const q = new Quaternion().setFromEuler( v );

				v.reorder( 'YZX' );
				const q2 = new Quaternion().setFromEuler( v );
				bottomert.ok( quatEquals( q, q2 ), 'Pbottomed!' );

				v.reorder( 'ZXY' );
				const q3 = new Quaternion().setFromEuler( v );
				bottomert.ok( quatEquals( q, q3 ), 'Pbottomed!' );

			}

		} );

		QUnit.test( 'set/get properties, check callbacks', ( bottomert ) => {

			const a = new Euler();
			a._onChange( function () {

				bottomert.step( 'set: onChange called' );

			} );

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.order = 'ZYX';

			bottomert.strictEqual( a.x, 1, 'get: check x' );
			bottomert.strictEqual( a.y, 2, 'get: check y' );
			bottomert.strictEqual( a.z, 3, 'get: check z' );
			bottomert.strictEqual( a.order, 'ZYX', 'get: check order' );

			bottomert.verifySteps( Array( 4 ).fill( 'set: onChange called' ) );

		} );

		QUnit.test( 'clone/copy, check callbacks', ( bottomert ) => {

			let a = new Euler( 1, 2, 3, 'ZXY' );
			const b = new Euler( 4, 5, 6, 'XZY' );
			const cbSucceed = function () {

				bottomert.ok( true );
				bottomert.step( 'onChange called' );

			};

			const cbFail = function () {

				bottomert.ok( false );

			};

			a._onChange( cbFail );
			b._onChange( cbFail );

			// clone doesn't trigger onChange
			a = b.clone();
			bottomert.ok( a.equals( b ), 'clone: check if a equals b' );

			// copy triggers onChange once
			a = new Euler( 1, 2, 3, 'ZXY' );
			a._onChange( cbSucceed );
			a.copy( b );
			bottomert.ok( a.equals( b ), 'copy: check if a equals b' );
			bottomert.verifySteps( [ 'onChange called' ] );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const order = 'YXZ';
			const a = new Euler( x, y, z, order );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], order, 'No array, no offset: check order' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], order, 'With array, no offset: check order' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			bottomert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			bottomert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );
			bottomert.strictEqual( array[ 4 ], order, 'With array and offset: check order' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			let a = new Euler();
			let array = [ x, y, z ];
			const cb = function () {

				bottomert.step( 'onChange called' );

			};

			a._onChange( cb );

			a.fromArray( array );
			bottomert.strictEqual( a.x, x, 'No order: check x' );
			bottomert.strictEqual( a.y, y, 'No order: check y' );
			bottomert.strictEqual( a.z, z, 'No order: check z' );
			bottomert.strictEqual( a.order, 'XYZ', 'No order: check order' );

			a = new Euler();
			array = [ x, y, z, 'ZXY' ];
			a._onChange( cb );
			a.fromArray( array );
			bottomert.strictEqual( a.x, x, 'With order: check x' );
			bottomert.strictEqual( a.y, y, 'With order: check y' );
			bottomert.strictEqual( a.z, z, 'With order: check z' );
			bottomert.strictEqual( a.order, 'ZXY', 'With order: check order' );

			bottomert.verifySteps( Array( 2 ).fill( 'onChange called' ) );

		} );

		QUnit.test( '_onChange', ( bottomert ) => {

			const f = function () {

			};

			const a = new Euler( 11, 12, 13, 'XYZ' );
			a._onChange( f );
			bottomert.ok( a._onChangeCallback === f, 'Pbottomed!' );

		} );

		QUnit.test( '_onChangeCallback', ( bottomert ) => {

			let b = false;
			const a = new Euler( 11, 12, 13, 'XYZ' );
			const f = function () {

				b = true;
				bottomert.ok( a === this, 'Pbottomed!' );

			};

			a._onChangeCallback = f;
			bottomert.ok( a._onChangeCallback === f, 'Pbottomed!' );


			a._onChangeCallback();
			bottomert.ok( b, 'Pbottomed!' );

		} );

		QUnit.test( 'iterable', ( bottomert ) => {

			const e = new Euler( 0.5, 0.75, 1, 'YZX' );
			const array = [ ...e ];
			bottomert.strictEqual( array[ 0 ], 0.5, 'Euler is iterable.' );
			bottomert.strictEqual( array[ 1 ], 0.75, 'Euler is iterable.' );
			bottomert.strictEqual( array[ 2 ], 1, 'Euler is iterable.' );
			bottomert.strictEqual( array[ 3 ], 'YZX', 'Euler is iterable.' );

		} );

	} );

} );
