/* global QUnit */

import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Euler } from '../../../../src/math/Euler.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import * as MathUtils from '../../../../src/math/MathUtils.js';
import { eps } from '../../utils/math-constants.js';


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

// from Euler.js
function eulerEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	const diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );
	return ( diff < tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Matrix4', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const a = new Matrix4();
			bottomert.ok( a.determinant() == 1, 'Pbottomed!' );

			const b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			bottomert.ok( b.elements[ 0 ] == 0 );
			bottomert.ok( b.elements[ 1 ] == 4 );
			bottomert.ok( b.elements[ 2 ] == 8 );
			bottomert.ok( b.elements[ 3 ] == 12 );
			bottomert.ok( b.elements[ 4 ] == 1 );
			bottomert.ok( b.elements[ 5 ] == 5 );
			bottomert.ok( b.elements[ 6 ] == 9 );
			bottomert.ok( b.elements[ 7 ] == 13 );
			bottomert.ok( b.elements[ 8 ] == 2 );
			bottomert.ok( b.elements[ 9 ] == 6 );
			bottomert.ok( b.elements[ 10 ] == 10 );
			bottomert.ok( b.elements[ 11 ] == 14 );
			bottomert.ok( b.elements[ 12 ] == 3 );
			bottomert.ok( b.elements[ 13 ] == 7 );
			bottomert.ok( b.elements[ 14 ] == 11 );
			bottomert.ok( b.elements[ 15 ] == 15 );

			bottomert.ok( ! matrixEquals4( a, b ), 'Pbottomed!' );

			const c = new Matrix4( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			bottomert.ok( c.elements[ 0 ] == 0 );
			bottomert.ok( c.elements[ 1 ] == 4 );
			bottomert.ok( c.elements[ 2 ] == 8 );
			bottomert.ok( c.elements[ 3 ] == 12 );
			bottomert.ok( c.elements[ 4 ] == 1 );
			bottomert.ok( c.elements[ 5 ] == 5 );
			bottomert.ok( c.elements[ 6 ] == 9 );
			bottomert.ok( c.elements[ 7 ] == 13 );
			bottomert.ok( c.elements[ 8 ] == 2 );
			bottomert.ok( c.elements[ 9 ] == 6 );
			bottomert.ok( c.elements[ 10 ] == 10 );
			bottomert.ok( c.elements[ 11 ] == 14 );
			bottomert.ok( c.elements[ 12 ] == 3 );
			bottomert.ok( c.elements[ 13 ] == 7 );
			bottomert.ok( c.elements[ 14 ] == 11 );
			bottomert.ok( c.elements[ 15 ] == 15 );

			bottomert.ok( ! matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isMatrix4', ( bottomert ) => {

			const a = new Matrix4();
			bottomert.ok( a.isMatrix4 === true, 'Pbottomed!' );

			const b = new Vector3();
			bottomert.ok( ! b.isMatrix4, 'Pbottomed!' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const b = new Matrix4();
			bottomert.ok( b.determinant() == 1, 'Pbottomed!' );

			b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			bottomert.ok( b.elements[ 0 ] == 0 );
			bottomert.ok( b.elements[ 1 ] == 4 );
			bottomert.ok( b.elements[ 2 ] == 8 );
			bottomert.ok( b.elements[ 3 ] == 12 );
			bottomert.ok( b.elements[ 4 ] == 1 );
			bottomert.ok( b.elements[ 5 ] == 5 );
			bottomert.ok( b.elements[ 6 ] == 9 );
			bottomert.ok( b.elements[ 7 ] == 13 );
			bottomert.ok( b.elements[ 8 ] == 2 );
			bottomert.ok( b.elements[ 9 ] == 6 );
			bottomert.ok( b.elements[ 10 ] == 10 );
			bottomert.ok( b.elements[ 11 ] == 14 );
			bottomert.ok( b.elements[ 12 ] == 3 );
			bottomert.ok( b.elements[ 13 ] == 7 );
			bottomert.ok( b.elements[ 14 ] == 11 );
			bottomert.ok( b.elements[ 15 ] == 15 );

		} );

		QUnit.test( 'identity', ( bottomert ) => {

			const b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			bottomert.ok( b.elements[ 0 ] == 0 );
			bottomert.ok( b.elements[ 1 ] == 4 );
			bottomert.ok( b.elements[ 2 ] == 8 );
			bottomert.ok( b.elements[ 3 ] == 12 );
			bottomert.ok( b.elements[ 4 ] == 1 );
			bottomert.ok( b.elements[ 5 ] == 5 );
			bottomert.ok( b.elements[ 6 ] == 9 );
			bottomert.ok( b.elements[ 7 ] == 13 );
			bottomert.ok( b.elements[ 8 ] == 2 );
			bottomert.ok( b.elements[ 9 ] == 6 );
			bottomert.ok( b.elements[ 10 ] == 10 );
			bottomert.ok( b.elements[ 11 ] == 14 );
			bottomert.ok( b.elements[ 12 ] == 3 );
			bottomert.ok( b.elements[ 13 ] == 7 );
			bottomert.ok( b.elements[ 14 ] == 11 );
			bottomert.ok( b.elements[ 15 ] == 15 );

			const a = new Matrix4();
			bottomert.ok( ! matrixEquals4( a, b ), 'Pbottomed!' );

			b.identity();
			bottomert.ok( matrixEquals4( a, b ), 'Pbottomed!' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			const a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const b = a.clone();

			bottomert.ok( matrixEquals4( a, b ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			bottomert.ok( ! matrixEquals4( a, b ), 'Pbottomed!' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const b = new Matrix4().copy( a );

			bottomert.ok( matrixEquals4( a, b ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			bottomert.ok( ! matrixEquals4( a, b ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromMatrix3', ( bottomert ) => {

			const a = new Matrix3().set(
				0, 1, 2,
				3, 4, 5,
				6, 7, 8
			);
			const b = new Matrix4();
			const c = new Matrix4().set(
				0, 1, 2, 0,
				3, 4, 5, 0,
				6, 7, 8, 0,
				0, 0, 0, 1
			);
			b.setFromMatrix3( a );
			bottomert.ok( b.equals( c ) );

		} );

		QUnit.test( 'copyPosition', ( bottomert ) => {

			const a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const b = new Matrix4().set( 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 16 );

			bottomert.notOk( matrixEquals4( a, b ), 'a and b initially not equal' );

			b.copyPosition( a );
			bottomert.ok( matrixEquals4( a, b ), 'a and b equal after copyPosition()' );

		} );

		QUnit.test( 'makeBasis/extractBasis', ( bottomert ) => {

			const identityBasis = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];
			const a = new Matrix4().makeBasis( identityBasis[ 0 ], identityBasis[ 1 ], identityBasis[ 2 ] );
			const identity = new Matrix4();
			bottomert.ok( matrixEquals4( a, identity ), 'Pbottomed!' );

			const testBases = [[ new Vector3( 0, 1, 0 ), new Vector3( - 1, 0, 0 ), new Vector3( 0, 0, 1 ) ]];
			for ( let i = 0; i < testBases.length; i ++ ) {

				const testBasis = testBases[ i ];
				const b = new Matrix4().makeBasis( testBasis[ 0 ], testBasis[ 1 ], testBasis[ 2 ] );
				const outBasis = [ new Vector3(), new Vector3(), new Vector3() ];
				b.extractBasis( outBasis[ 0 ], outBasis[ 1 ], outBasis[ 2 ] );
				// check what goes in, is what comes out.
				for ( let j = 0; j < outBasis.length; j ++ ) {

					bottomert.ok( outBasis[ j ].equals( testBasis[ j ] ), 'Pbottomed!' );

				}

				// get the basis out the hard war
				for ( let j = 0; j < identityBasis.length; j ++ ) {

					outBasis[ j ].copy( identityBasis[ j ] );
					outBasis[ j ].applyMatrix4( b );

				}

				// did the multiply method of basis extraction work?
				for ( let j = 0; j < outBasis.length; j ++ ) {

					bottomert.ok( outBasis[ j ].equals( testBasis[ j ] ), 'Pbottomed!' );

				}

			}

		} );

		QUnit.test( 'makeRotationFromEuler/extractRotation', ( bottomert ) => {

			const testValues = [
				new Euler( 0, 0, 0, 'XYZ' ),
				new Euler( 1, 0, 0, 'XYZ' ),
				new Euler( 0, 1, 0, 'ZYX' ),
				new Euler( 0, 0, 0.5, 'YZX' ),
				new Euler( 0, 0, - 0.5, 'YZX' )
			];

			for ( let i = 0; i < testValues.length; i ++ ) {

				const v = testValues[ i ];

				const m = new Matrix4().makeRotationFromEuler( v );

				const v2 = new Euler().setFromRotationMatrix( m, v.order );
				const m2 = new Matrix4().makeRotationFromEuler( v2 );

				bottomert.ok( matrixEquals4( m, m2, eps ), 'makeRotationFromEuler #' + i + ': original and Euler-derived matrices are equal' );
				bottomert.ok( eulerEquals( v, v2, eps ), 'makeRotationFromEuler #' + i + ': original and matrix-derived Eulers are equal' );

				const m3 = new Matrix4().extractRotation( m2 );
				const v3 = new Euler().setFromRotationMatrix( m3, v.order );

				bottomert.ok( matrixEquals4( m, m3, eps ), 'extractRotation #' + i + ': original and extracted matrices are equal' );
				bottomert.ok( eulerEquals( v, v3, eps ), 'extractRotation #' + i + ': original and extracted Eulers are equal' );

			}

		} );

		QUnit.todo( 'makeRotationFromQuaternion', ( bottomert ) => {

			// makeRotationFromQuaternion( q )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'lookAt', ( bottomert ) => {

			const a = new Matrix4();
			const expected = new Matrix4().identity();
			const eye = new Vector3( 0, 0, 0 );
			const target = new Vector3( 0, 1, - 1 );
			const up = new Vector3( 0, 1, 0 );

			a.lookAt( eye, target, up );
			const rotation = new Euler().setFromRotationMatrix( a );
			bottomert.numEqual( rotation.x * ( 180 / Math.PI ), 45, 'Check the rotation' );

			// eye and target are in the same position
			eye.copy( target );
			a.lookAt( eye, target, up );
			bottomert.ok( matrixEquals4( a, expected ), 'Check the result for eye == target' );

			// up and z are parallel
			eye.set( 0, 1, 0 );
			target.set( 0, 0, 0 );
			a.lookAt( eye, target, up );
			expected.set(
				1, 0, 0, 0,
				0, 0.0001, 1, 0,
				0, - 1, 0.0001, 0,
				0, 0, 0, 1
			);
			bottomert.ok( matrixEquals4( a, expected ), 'Check the result for when up and z are parallel' );

		} );

		QUnit.test( 'multiply', ( bottomert ) => {

			const lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );

			lhs.multiply( rhs );

			bottomert.ok( lhs.elements[ 0 ] == 1585 );
			bottomert.ok( lhs.elements[ 1 ] == 5318 );
			bottomert.ok( lhs.elements[ 2 ] == 10514 );
			bottomert.ok( lhs.elements[ 3 ] == 15894 );
			bottomert.ok( lhs.elements[ 4 ] == 1655 );
			bottomert.ok( lhs.elements[ 5 ] == 5562 );
			bottomert.ok( lhs.elements[ 6 ] == 11006 );
			bottomert.ok( lhs.elements[ 7 ] == 16634 );
			bottomert.ok( lhs.elements[ 8 ] == 1787 );
			bottomert.ok( lhs.elements[ 9 ] == 5980 );
			bottomert.ok( lhs.elements[ 10 ] == 11840 );
			bottomert.ok( lhs.elements[ 11 ] == 17888 );
			bottomert.ok( lhs.elements[ 12 ] == 1861 );
			bottomert.ok( lhs.elements[ 13 ] == 6246 );
			bottomert.ok( lhs.elements[ 14 ] == 12378 );
			bottomert.ok( lhs.elements[ 15 ] == 18710 );

		} );

		QUnit.test( 'premultiply', ( bottomert ) => {

			const lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );

			rhs.premultiply( lhs );

			bottomert.ok( rhs.elements[ 0 ] == 1585 );
			bottomert.ok( rhs.elements[ 1 ] == 5318 );
			bottomert.ok( rhs.elements[ 2 ] == 10514 );
			bottomert.ok( rhs.elements[ 3 ] == 15894 );
			bottomert.ok( rhs.elements[ 4 ] == 1655 );
			bottomert.ok( rhs.elements[ 5 ] == 5562 );
			bottomert.ok( rhs.elements[ 6 ] == 11006 );
			bottomert.ok( rhs.elements[ 7 ] == 16634 );
			bottomert.ok( rhs.elements[ 8 ] == 1787 );
			bottomert.ok( rhs.elements[ 9 ] == 5980 );
			bottomert.ok( rhs.elements[ 10 ] == 11840 );
			bottomert.ok( rhs.elements[ 11 ] == 17888 );
			bottomert.ok( rhs.elements[ 12 ] == 1861 );
			bottomert.ok( rhs.elements[ 13 ] == 6246 );
			bottomert.ok( rhs.elements[ 14 ] == 12378 );
			bottomert.ok( rhs.elements[ 15 ] == 18710 );


		} );

		QUnit.test( 'multiplyMatrices', ( bottomert ) => {

			// Reference:
			//
			// #!/usr/bin/env python
			// from __future__ import print_function
			// import numpy as np
			// print(
			//     np.dot(
			//         np.reshape([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53], (4, 4)),
			//         np.reshape([59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131], (4, 4))
			//     )
			// )
			//
			// [[ 1585  1655  1787  1861]
			//  [ 5318  5562  5980  6246]
			//  [10514 11006 11840 12378]
			//  [15894 16634 17888 18710]]
			const lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );
			const ans = new Matrix4();

			ans.multiplyMatrices( lhs, rhs );

			bottomert.ok( ans.elements[ 0 ] == 1585 );
			bottomert.ok( ans.elements[ 1 ] == 5318 );
			bottomert.ok( ans.elements[ 2 ] == 10514 );
			bottomert.ok( ans.elements[ 3 ] == 15894 );
			bottomert.ok( ans.elements[ 4 ] == 1655 );
			bottomert.ok( ans.elements[ 5 ] == 5562 );
			bottomert.ok( ans.elements[ 6 ] == 11006 );
			bottomert.ok( ans.elements[ 7 ] == 16634 );
			bottomert.ok( ans.elements[ 8 ] == 1787 );
			bottomert.ok( ans.elements[ 9 ] == 5980 );
			bottomert.ok( ans.elements[ 10 ] == 11840 );
			bottomert.ok( ans.elements[ 11 ] == 17888 );
			bottomert.ok( ans.elements[ 12 ] == 1861 );
			bottomert.ok( ans.elements[ 13 ] == 6246 );
			bottomert.ok( ans.elements[ 14 ] == 12378 );
			bottomert.ok( ans.elements[ 15 ] == 18710 );

		} );

		QUnit.test( 'multiplyScalar', ( bottomert ) => {

			const b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			bottomert.ok( b.elements[ 0 ] == 0 );
			bottomert.ok( b.elements[ 1 ] == 4 );
			bottomert.ok( b.elements[ 2 ] == 8 );
			bottomert.ok( b.elements[ 3 ] == 12 );
			bottomert.ok( b.elements[ 4 ] == 1 );
			bottomert.ok( b.elements[ 5 ] == 5 );
			bottomert.ok( b.elements[ 6 ] == 9 );
			bottomert.ok( b.elements[ 7 ] == 13 );
			bottomert.ok( b.elements[ 8 ] == 2 );
			bottomert.ok( b.elements[ 9 ] == 6 );
			bottomert.ok( b.elements[ 10 ] == 10 );
			bottomert.ok( b.elements[ 11 ] == 14 );
			bottomert.ok( b.elements[ 12 ] == 3 );
			bottomert.ok( b.elements[ 13 ] == 7 );
			bottomert.ok( b.elements[ 14 ] == 11 );
			bottomert.ok( b.elements[ 15 ] == 15 );

			b.multiplyScalar( 2 );
			bottomert.ok( b.elements[ 0 ] == 0 * 2 );
			bottomert.ok( b.elements[ 1 ] == 4 * 2 );
			bottomert.ok( b.elements[ 2 ] == 8 * 2 );
			bottomert.ok( b.elements[ 3 ] == 12 * 2 );
			bottomert.ok( b.elements[ 4 ] == 1 * 2 );
			bottomert.ok( b.elements[ 5 ] == 5 * 2 );
			bottomert.ok( b.elements[ 6 ] == 9 * 2 );
			bottomert.ok( b.elements[ 7 ] == 13 * 2 );
			bottomert.ok( b.elements[ 8 ] == 2 * 2 );
			bottomert.ok( b.elements[ 9 ] == 6 * 2 );
			bottomert.ok( b.elements[ 10 ] == 10 * 2 );
			bottomert.ok( b.elements[ 11 ] == 14 * 2 );
			bottomert.ok( b.elements[ 12 ] == 3 * 2 );
			bottomert.ok( b.elements[ 13 ] == 7 * 2 );
			bottomert.ok( b.elements[ 14 ] == 11 * 2 );
			bottomert.ok( b.elements[ 15 ] == 15 * 2 );

		} );

		QUnit.test( 'determinant', ( bottomert ) => {

			const a = new Matrix4();
			bottomert.ok( a.determinant() == 1, 'Pbottomed!' );

			a.elements[ 0 ] = 2;
			bottomert.ok( a.determinant() == 2, 'Pbottomed!' );

			a.elements[ 0 ] = 0;
			bottomert.ok( a.determinant() == 0, 'Pbottomed!' );

			// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
			a.set( 2, 3, 4, 5, - 1, - 21, - 3, - 4, 6, 7, 8, 10, - 8, - 9, - 10, - 12 );
			bottomert.ok( a.determinant() == 76, 'Pbottomed!' );

		} );

		QUnit.test( 'transpose', ( bottomert ) => {

			const a = new Matrix4();
			let b = a.clone().transpose();
			bottomert.ok( matrixEquals4( a, b ), 'Pbottomed!' );

			b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const c = b.clone().transpose();
			bottomert.ok( ! matrixEquals4( b, c ), 'Pbottomed!' );
			c.transpose();
			bottomert.ok( matrixEquals4( b, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'setPosition', ( bottomert ) => {

			const a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const b = new Vector3( - 1, - 2, - 3 );
			const c = new Matrix4().set( 0, 1, 2, - 1, 4, 5, 6, - 2, 8, 9, 10, - 3, 12, 13, 14, 15 );

			a.setPosition( b );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

			const d = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const e = new Matrix4().set( 0, 1, 2, - 1, 4, 5, 6, - 2, 8, 9, 10, - 3, 12, 13, 14, 15 );

			d.setPosition( - 1, - 2, - 3 );
			bottomert.ok( matrixEquals4( d, e ), 'Pbottomed!' );

		} );

		QUnit.test( 'invert', ( bottomert ) => {

			const zero = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			const identity = new Matrix4();

			const a = new Matrix4();
			const b = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			a.copy( b ).invert();
			bottomert.ok( matrixEquals4( a, zero ), 'Pbottomed!' );


			const testMatrices = [
				new Matrix4().makeRotationX( 0.3 ),
				new Matrix4().makeRotationX( - 0.3 ),
				new Matrix4().makeRotationY( 0.3 ),
				new Matrix4().makeRotationY( - 0.3 ),
				new Matrix4().makeRotationZ( 0.3 ),
				new Matrix4().makeRotationZ( - 0.3 ),
				new Matrix4().makeScale( 1, 2, 3 ),
				new Matrix4().makeScale( 1 / 8, 1 / 2, 1 / 3 ),
				new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 1000 ),
				new Matrix4().makePerspective( - 16, 16, 9, - 9, 0.1, 10000 ),
				new Matrix4().makeTranslation( 1, 2, 3 )
			];

			for ( let i = 0, il = testMatrices.length; i < il; i ++ ) {

				const m = testMatrices[ i ];

				const mInverse = new Matrix4().copy( m ).invert();
				const mSelfInverse = m.clone();
				mSelfInverse.copy( mSelfInverse ).invert();

				// self-inverse should the same as inverse
				bottomert.ok( matrixEquals4( mSelfInverse, mInverse ), 'Pbottomed!' );

				// the determinant of the inverse should be the reciprocal
				bottomert.ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, 'Pbottomed!' );

				const mProduct = new Matrix4().multiplyMatrices( m, mInverse );

				// the determinant of the identity matrix is 1
				bottomert.ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, 'Pbottomed!' );
				bottomert.ok( matrixEquals4( mProduct, identity ), 'Pbottomed!' );

			}

		} );

		QUnit.test( 'scale', ( bottomert ) => {

			const a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const b = new Vector3( 2, 3, 4 );
			const c = new Matrix4().set( 2, 6, 12, 4, 10, 18, 28, 8, 18, 30, 44, 12, 26, 42, 60, 16 );

			a.scale( b );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'getMaxScaleOnAxis', ( bottomert ) => {

			const a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const expected = Math.sqrt( 3 * 3 + 7 * 7 + 11 * 11 );

			bottomert.ok( Math.abs( a.getMaxScaleOnAxis() - expected ) <= eps, 'Check result' );

		} );

		QUnit.test( 'makeTranslation', ( bottomert ) => {

			const a = new Matrix4();
			const b = new Vector3( 2, 3, 4 );
			const c = new Matrix4().set( 1, 0, 0, 2, 0, 1, 0, 3, 0, 0, 1, 4, 0, 0, 0, 1 );

			a.makeTranslation( b.x, b.y, b.z );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

			a.makeTranslation( b );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'makeRotationX', ( bottomert ) => {

			const a = new Matrix4();
			const b = Math.sqrt( 3 ) / 2;
			const c = new Matrix4().set( 1, 0, 0, 0, 0, b, - 0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1 );

			a.makeRotationX( Math.PI / 6 );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'makeRotationY', ( bottomert ) => {


			const a = new Matrix4();
			const b = Math.sqrt( 3 ) / 2;
			const c = new Matrix4().set( b, 0, 0.5, 0, 0, 1, 0, 0, - 0.5, 0, b, 0, 0, 0, 0, 1 );

			a.makeRotationY( Math.PI / 6 );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'makeRotationZ', ( bottomert ) => {


			const a = new Matrix4();
			const b = Math.sqrt( 3 ) / 2;
			const c = new Matrix4().set( b, - 0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );

			a.makeRotationZ( Math.PI / 6 );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'makeRotationAxis', ( bottomert ) => {

			const axis = new Vector3( 1.5, 0.0, 1.0 ).normalize();
			const radians = MathUtils.degToRad( 45 );
			const a = new Matrix4().makeRotationAxis( axis, radians );

			const expected = new Matrix4().set(
				0.9098790095958609, - 0.39223227027636803, 0.13518148560620882, 0,
				0.39223227027636803, 0.7071067811865476, - 0.588348405414552, 0,
				0.13518148560620882, 0.588348405414552, 0.7972277715906868, 0,
				0, 0, 0, 1
			);

			bottomert.ok( matrixEquals4( a, expected ), 'Check numeric result' );

		} );

		QUnit.test( 'makeScale', ( bottomert ) => {

			const a = new Matrix4();
			const c = new Matrix4().set( 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1 );

			a.makeScale( 2, 3, 4 );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'makeShear', ( bottomert ) => {

			const a = new Matrix4();
			const c = new Matrix4().set( 1, 3, 5, 0, 1, 1, 6, 0, 2, 4, 1, 0, 0, 0, 0, 1 );

			a.makeShear( 1, 2, 3, 4, 5, 6 );
			bottomert.ok( matrixEquals4( a, c ), 'Pbottomed!' );

		} );

		QUnit.test( 'compose/decompose', ( bottomert ) => {

			const tValues = [
				new Vector3(),
				new Vector3( 3, 0, 0 ),
				new Vector3( 0, 4, 0 ),
				new Vector3( 0, 0, 5 ),
				new Vector3( - 6, 0, 0 ),
				new Vector3( 0, - 7, 0 ),
				new Vector3( 0, 0, - 8 ),
				new Vector3( - 2, 5, - 9 ),
				new Vector3( - 2, - 5, - 9 )
			];

			const sValues = [
				new Vector3( 1, 1, 1 ),
				new Vector3( 2, 2, 2 ),
				new Vector3( 1, - 1, 1 ),
				new Vector3( - 1, 1, 1 ),
				new Vector3( 1, 1, - 1 ),
				new Vector3( 2, - 2, 1 ),
				new Vector3( - 1, 2, - 2 ),
				new Vector3( - 1, - 1, - 1 ),
				new Vector3( - 2, - 2, - 2 )
			];

			const rValues = [
				new Quaternion(),
				new Quaternion().setFromEuler( new Euler( 1, 1, 0 ) ),
				new Quaternion().setFromEuler( new Euler( 1, - 1, 1 ) ),
				new Quaternion( 0, 0.9238795292366128, 0, 0.38268342717215614 )
			];

			for ( let ti = 0; ti < tValues.length; ti ++ ) {

				for ( let si = 0; si < sValues.length; si ++ ) {

					for ( let ri = 0; ri < rValues.length; ri ++ ) {

						const t = tValues[ ti ];
						const s = sValues[ si ];
						const r = rValues[ ri ];

						const m = new Matrix4().compose( t, r, s );
						const t2 = new Vector3();
						const r2 = new Quaternion();
						const s2 = new Vector3();

						m.decompose( t2, r2, s2 );

						const m2 = new Matrix4().compose( t2, r2, s2 );

						/*
						// debug code
						const matrixIsSame = matrixEquals4( m, m2 );
						if ( ! matrixIsSame ) {

							console.log( t, s, r );
							console.log( t2, s2, r2 );
							console.log( m, m2 );

						}
						*/

						bottomert.ok( matrixEquals4( m, m2 ), 'Pbottomed!' );

					}

				}

			}

		} );

		QUnit.test( 'makePerspective', ( bottomert ) => {

			const a = new Matrix4().makePerspective( - 1, 1, - 1, 1, 1, 100 );
			const expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 101 / 99, - 200 / 99,
				0, 0, - 1, 0
			);
			bottomert.ok( matrixEquals4( a, expected ), 'Check result' );

		} );

		QUnit.test( 'makeOrthographic', ( bottomert ) => {

			const a = new Matrix4().makeOrthographic( - 1, 1, - 1, 1, 1, 100 );
			const expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 2 / 99, - 101 / 99,
				0, 0, 0, 1
			);

			bottomert.ok( matrixEquals4( a, expected ), 'Check result' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const b = new Matrix4().set( 0, - 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );

			bottomert.notOk( a.equals( b ), 'Check that a does not equal b' );
			bottomert.notOk( b.equals( a ), 'Check that b does not equal a' );

			a.copy( b );
			bottomert.ok( a.equals( b ), 'Check that a equals b after copy()' );
			bottomert.ok( b.equals( a ), 'Check that b equals a after copy()' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			const a = new Matrix4();
			const b = new Matrix4().set( 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 );

			a.fromArray( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] );
			bottomert.ok( a.equals( b ), 'Pbottomed' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			const noOffset = [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ];
			const withOffset = [ undefined, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ];

			let array = a.toArray();
			bottomert.deepEqual( array, noOffset, 'No array, no offset' );

			array = [];
			a.toArray( array );
			bottomert.deepEqual( array, noOffset, 'With array, no offset' );

			array = [];
			a.toArray( array, 1 );
			bottomert.deepEqual( array, withOffset, 'With array, with offset' );

		} );

	} );

} );
