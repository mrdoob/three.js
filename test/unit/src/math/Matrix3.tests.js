/* global QUnit */

import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';

function matrixEquals3( b, a, tolerance ) {

	tolerance = tolerance || 0.0001;
	if ( a.elements.length != b.elements.length ) {

		return false;

	}

	for ( let i = 0, il = a.elements.length; i < il; i ++ ) {

		const delta = Math.abs( a.elements[ i ] - b.elements[ i ] );
		if ( delta > tolerance ) {

			return false;

		}

	}

	return true;

}

function toMatrix4( m3 ) {

	const result = new Matrix4();
	const re = result.elements;
	const me = m3.elements;
	re[ 0 ] = me[ 0 ];
	re[ 1 ] = me[ 1 ];
	re[ 2 ] = me[ 2 ];
	re[ 4 ] = me[ 3 ];
	re[ 5 ] = me[ 4 ];
	re[ 6 ] = me[ 5 ];
	re[ 8 ] = me[ 6 ];
	re[ 9 ] = me[ 7 ];
	re[ 10 ] = me[ 8 ];

	return result;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Matrix3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const a = new Matrix3();
			assert.ok( a.determinant() == 1, 'Passed!' );

			const b = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 3 );
			assert.ok( b.elements[ 2 ] == 6 );
			assert.ok( b.elements[ 3 ] == 1 );
			assert.ok( b.elements[ 4 ] == 4 );
			assert.ok( b.elements[ 5 ] == 7 );
			assert.ok( b.elements[ 6 ] == 2 );
			assert.ok( b.elements[ 7 ] == 5 );
			assert.ok( b.elements[ 8 ] == 8 );

			assert.ok( ! matrixEquals3( a, b ), 'Passed!' );

			const c = new Matrix3( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.ok( c.elements[ 0 ] == 0 );
			assert.ok( c.elements[ 1 ] == 3 );
			assert.ok( c.elements[ 2 ] == 6 );
			assert.ok( c.elements[ 3 ] == 1 );
			assert.ok( c.elements[ 4 ] == 4 );
			assert.ok( c.elements[ 5 ] == 7 );
			assert.ok( c.elements[ 6 ] == 2 );
			assert.ok( c.elements[ 7 ] == 5 );
			assert.ok( c.elements[ 8 ] == 8 );

			assert.ok( ! matrixEquals3( a, c ), 'Passed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isMatrix3', ( assert ) => {

			const a = new Matrix3();
			assert.ok( a.isMatrix3 === true, 'Passed!' );

			const b = new Matrix4();
			assert.ok( ! b.isMatrix3, 'Passed!' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const b = new Matrix3();
			assert.ok( b.determinant() == 1, 'Passed!' );

			b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 3 );
			assert.ok( b.elements[ 2 ] == 6 );
			assert.ok( b.elements[ 3 ] == 1 );
			assert.ok( b.elements[ 4 ] == 4 );
			assert.ok( b.elements[ 5 ] == 7 );
			assert.ok( b.elements[ 6 ] == 2 );
			assert.ok( b.elements[ 7 ] == 5 );
			assert.ok( b.elements[ 8 ] == 8 );

		} );

		QUnit.test( 'identity', ( assert ) => {

			const b = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 3 );
			assert.ok( b.elements[ 2 ] == 6 );
			assert.ok( b.elements[ 3 ] == 1 );
			assert.ok( b.elements[ 4 ] == 4 );
			assert.ok( b.elements[ 5 ] == 7 );
			assert.ok( b.elements[ 6 ] == 2 );
			assert.ok( b.elements[ 7 ] == 5 );
			assert.ok( b.elements[ 8 ] == 8 );

			const a = new Matrix3();
			assert.ok( ! matrixEquals3( a, b ), 'Passed!' );

			b.identity();
			assert.ok( matrixEquals3( a, b ), 'Passed!' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const a = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const b = a.clone();

			assert.ok( matrixEquals3( a, b ), 'Passed!' );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			assert.ok( ! matrixEquals3( a, b ), 'Passed!' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const a = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const b = new Matrix3().copy( a );

			assert.ok( matrixEquals3( a, b ), 'Passed!' );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			assert.ok( ! matrixEquals3( a, b ), 'Passed!' );

		} );

		QUnit.todo( 'extractBasis', ( assert ) => {

			// extractBasis( xAxis, yAxis, zAxis )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromMatrix4', ( assert ) => {


			const a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const b = new Matrix3();
			const c = new Matrix3().set( 0, 1, 2, 4, 5, 6, 8, 9, 10 );
			b.setFromMatrix4( a );
			assert.ok( b.equals( c ) );

		} );

		QUnit.test( 'multiply/premultiply', ( assert ) => {

			// both simply just wrap multiplyMatrices
			const a = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const b = new Matrix3().set( 29, 31, 37, 41, 43, 47, 53, 59, 61 );
			const expectedMultiply = [ 446, 1343, 2491, 486, 1457, 2701, 520, 1569, 2925 ];
			const expectedPremultiply = [ 904, 1182, 1556, 1131, 1489, 1967, 1399, 1845, 2435 ];

			a.multiply( b );
			assert.deepEqual( a.elements, expectedMultiply, 'multiply: check result' );

			a.set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			a.premultiply( b );
			assert.deepEqual( a.elements, expectedPremultiply, 'premultiply: check result' );

		} );

		QUnit.test( 'multiplyMatrices', ( assert ) => {

			// Reference:
			//
			// #!/usr/bin/env python
			// from __future__ import print_function
			// import numpy as np
			// print(
			//     np.dot(
			//         np.reshape([2, 3, 5, 7, 11, 13, 17, 19, 23], (3, 3)),
			//         np.reshape([29, 31, 37, 41, 43, 47, 53, 59, 61], (3, 3))
			//     )
			// )
			//
			// [[ 446  486  520]
			//  [1343 1457 1569]
			//  [2491 2701 2925]]
			const lhs = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const rhs = new Matrix3().set( 29, 31, 37, 41, 43, 47, 53, 59, 61 );
			const ans = new Matrix3();

			ans.multiplyMatrices( lhs, rhs );

			assert.ok( ans.elements[ 0 ] == 446 );
			assert.ok( ans.elements[ 1 ] == 1343 );
			assert.ok( ans.elements[ 2 ] == 2491 );
			assert.ok( ans.elements[ 3 ] == 486 );
			assert.ok( ans.elements[ 4 ] == 1457 );
			assert.ok( ans.elements[ 5 ] == 2701 );
			assert.ok( ans.elements[ 6 ] == 520 );
			assert.ok( ans.elements[ 7 ] == 1569 );
			assert.ok( ans.elements[ 8 ] == 2925 );

		} );

		QUnit.test( 'multiplyScalar', ( assert ) => {

			const b = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 3 );
			assert.ok( b.elements[ 2 ] == 6 );
			assert.ok( b.elements[ 3 ] == 1 );
			assert.ok( b.elements[ 4 ] == 4 );
			assert.ok( b.elements[ 5 ] == 7 );
			assert.ok( b.elements[ 6 ] == 2 );
			assert.ok( b.elements[ 7 ] == 5 );
			assert.ok( b.elements[ 8 ] == 8 );

			b.multiplyScalar( 2 );
			assert.ok( b.elements[ 0 ] == 0 * 2 );
			assert.ok( b.elements[ 1 ] == 3 * 2 );
			assert.ok( b.elements[ 2 ] == 6 * 2 );
			assert.ok( b.elements[ 3 ] == 1 * 2 );
			assert.ok( b.elements[ 4 ] == 4 * 2 );
			assert.ok( b.elements[ 5 ] == 7 * 2 );
			assert.ok( b.elements[ 6 ] == 2 * 2 );
			assert.ok( b.elements[ 7 ] == 5 * 2 );
			assert.ok( b.elements[ 8 ] == 8 * 2 );

		} );

		QUnit.test( 'determinant', ( assert ) => {

			const a = new Matrix3();
			assert.ok( a.determinant() == 1, 'Passed!' );

			a.elements[ 0 ] = 2;
			assert.ok( a.determinant() == 2, 'Passed!' );

			a.elements[ 0 ] = 0;
			assert.ok( a.determinant() == 0, 'Passed!' );

			// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/threeD/index.htm
			a.set( 2, 3, 4, 5, 13, 7, 8, 9, 11 );
			assert.ok( a.determinant() == - 73, 'Passed!' );

		} );

		QUnit.test( 'invert', ( assert ) => {

			const zero = new Matrix3().set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			const identity4 = new Matrix4();
			const a = new Matrix3().set( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			const b = new Matrix3();

			b.copy( a ).invert();
			assert.ok( matrixEquals3( b, zero ), 'Matrix a is zero matrix' );

			const testMatrices = [
				new Matrix4().makeRotationX( 0.3 ),
				new Matrix4().makeRotationX( - 0.3 ),
				new Matrix4().makeRotationY( 0.3 ),
				new Matrix4().makeRotationY( - 0.3 ),
				new Matrix4().makeRotationZ( 0.3 ),
				new Matrix4().makeRotationZ( - 0.3 ),
				new Matrix4().makeScale( 1, 2, 3 ),
				new Matrix4().makeScale( 1 / 8, 1 / 2, 1 / 3 )
			];

			for ( let i = 0, il = testMatrices.length; i < il; i ++ ) {

				const m = testMatrices[ i ];

				a.setFromMatrix4( m );
				const mInverse3 = b.copy( a ).invert();

				const mInverse = toMatrix4( mInverse3 );

				// the determinant of the inverse should be the reciprocal
				assert.ok( Math.abs( a.determinant() * mInverse3.determinant() - 1 ) < 0.0001, 'Passed!' );
				assert.ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, 'Passed!' );

				const mProduct = new Matrix4().multiplyMatrices( m, mInverse );
				assert.ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, 'Passed!' );
				assert.ok( matrixEquals3( mProduct, identity4 ), 'Passed!' );

			}

		} );

		QUnit.test( 'transpose', ( assert ) => {

			const a = new Matrix3();
			let b = a.clone().transpose();
			assert.ok( matrixEquals3( a, b ), 'Passed!' );

			b = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const c = b.clone().transpose();
			assert.ok( ! matrixEquals3( b, c ), 'Passed!' );
			c.transpose();
			assert.ok( matrixEquals3( b, c ), 'Passed!' );

		} );

		QUnit.test( 'getNormalMatrix', ( assert ) => {

			const a = new Matrix3();
			const b = new Matrix4().set(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 57
			);
			const expected = new Matrix3().set(
				- 1.2857142857142856, 0.7142857142857143, 0.2857142857142857,
				0.7428571428571429, - 0.7571428571428571, 0.15714285714285714,
				- 0.19999999999999998, 0.3, - 0.09999999999999999
			);

			a.getNormalMatrix( b );
			assert.ok( matrixEquals3( a, expected ), 'Check resulting Matrix3' );

		} );

		QUnit.test( 'transposeIntoArray', ( assert ) => {

			const a = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const b = [];
			a.transposeIntoArray( b );

			assert.ok( b[ 0 ] == 0 );
			assert.ok( b[ 1 ] == 1 );
			assert.ok( b[ 2 ] == 2 );
			assert.ok( b[ 3 ] == 3 );
			assert.ok( b[ 4 ] == 4 );
			assert.ok( b[ 5 ] == 5 );
			assert.ok( b[ 5 ] == 5 );
			assert.ok( b[ 6 ] == 6 );
			assert.ok( b[ 7 ] == 7 );
			assert.ok( b[ 8 ] == 8 );

		} );

		QUnit.test( 'setUvTransform', ( assert ) => {

			const a = new Matrix3().set(
				0.1767766952966369, 0.17677669529663687, 0.32322330470336313,
				- 0.17677669529663687, 0.1767766952966369, 0.5,
				0, 0, 1
			);
			const b = new Matrix3();
			const params = {
				centerX: 0.5,
				centerY: 0.5,
				offsetX: 0,
				offsetY: 0,
				repeatX: 0.25,
				repeatY: 0.25,
				rotation: 0.7753981633974483
			};
			const expected = new Matrix3().set(
				0.1785355940258599, 0.17500011904519763, 0.32323214346447127,
				- 0.17500011904519763, 0.1785355940258599, 0.4982322625096689,
				0, 0, 1
			);

			a.setUvTransform(
				params.offsetX, params.offsetY,
				params.repeatX, params.repeatY,
				params.rotation,
				params.centerX, params.centerY
			);

			b.identity()
			 .translate( - params.centerX, - params.centerY )
			 .rotate( params.rotation )
			 .scale( params.repeatX, params.repeatY )
			 .translate( params.centerX, params.centerY )
			 .translate( params.offsetX, params.offsetY );

			assert.ok( matrixEquals3( a, expected ), 'Check direct method' );
			assert.ok( matrixEquals3( b, expected ), 'Check indirect method' );

		} );

		QUnit.test( 'scale', ( assert ) => {

			const a = new Matrix3().set( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			const expected = new Matrix3().set(
				0.25, 0.5, 0.75,
				1, 1.25, 1.5,
				7, 8, 9
			);

			a.scale( 0.25, 0.25 );
			assert.ok( matrixEquals3( a, expected ), 'Check scaling result' );

		} );

		QUnit.test( 'rotate', ( assert ) => {

			const a = new Matrix3().set( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			const expected = new Matrix3().set(
				3.5355339059327373, 4.949747468305833, 6.363961030678928,
				2.121320343559643, 2.121320343559643, 2.1213203435596433,
				7, 8, 9
			);

			a.rotate( Math.PI / 4 );
			assert.ok( matrixEquals3( a, expected ), 'Check rotated result' );

		} );

		QUnit.test( 'translate', ( assert ) => {

			const a = new Matrix3().set( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			const expected = new Matrix3().set( 22, 26, 30, 53, 61, 69, 7, 8, 9 );

			a.translate( 3, 7 );
			assert.ok( matrixEquals3( a, expected ), 'Check translation result' );

		} );

		QUnit.todo( 'makeTranslation', ( assert ) => {

			const a = new Matrix3();
			const b = new Vector2( 1, 2 );
			const c = new Matrix3().set( 1, 0, 1, 0, 1, 2, 0, 0, 1 );

			a.makeTranslation( b.x, b.y );
			assert.ok( matrixEquals3( a, c ), 'Check translation result' );

			a.makeTranslation( b );
			assert.ok( matrixEquals3( a, c ), 'Check translation result' );

		} );

		QUnit.todo( 'makeRotation', ( assert ) => {

			// makeRotation( theta ) // counterclockwise
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'makeScale', ( assert ) => {

			// makeScale( x, y )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( assert ) => {

			const a = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const b = new Matrix3().set( 0, - 1, 2, 3, 4, 5, 6, 7, 8 );

			assert.notOk( a.equals( b ), 'Check that a does not equal b' );
			assert.notOk( b.equals( a ), 'Check that b does not equal a' );

			a.copy( b );
			assert.ok( a.equals( b ), 'Check that a equals b after copy()' );
			assert.ok( b.equals( a ), 'Check that b equals a after copy()' );

		} );

		QUnit.test( 'fromArray', ( assert ) => {

			let b = new Matrix3();
			b.fromArray( [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ] );

			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 1 );
			assert.ok( b.elements[ 2 ] == 2 );
			assert.ok( b.elements[ 3 ] == 3 );
			assert.ok( b.elements[ 4 ] == 4 );
			assert.ok( b.elements[ 5 ] == 5 );
			assert.ok( b.elements[ 6 ] == 6 );
			assert.ok( b.elements[ 7 ] == 7 );
			assert.ok( b.elements[ 8 ] == 8 );

			b = new Matrix3();
			b.fromArray( [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 ], 10 );

			assert.ok( b.elements[ 0 ] == 10 );
			assert.ok( b.elements[ 1 ] == 11 );
			assert.ok( b.elements[ 2 ] == 12 );
			assert.ok( b.elements[ 3 ] == 13 );
			assert.ok( b.elements[ 4 ] == 14 );
			assert.ok( b.elements[ 5 ] == 15 );
			assert.ok( b.elements[ 6 ] == 16 );
			assert.ok( b.elements[ 7 ] == 17 );
			assert.ok( b.elements[ 8 ] == 18 );

		} );

		QUnit.test( 'toArray', ( assert ) => {

			const a = new Matrix3().set( 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			const noOffset = [ 1, 4, 7, 2, 5, 8, 3, 6, 9 ];
			const withOffset = [ undefined, 1, 4, 7, 2, 5, 8, 3, 6, 9 ];

			let array = a.toArray();
			assert.deepEqual( array, noOffset, 'No array, no offset' );

			array = [];
			a.toArray( array );
			assert.deepEqual( array, noOffset, 'With array, no offset' );

			array = [];
			a.toArray( array, 1 );
			assert.deepEqual( array, withOffset, 'With array, with offset' );

		} );

	} );

} );
