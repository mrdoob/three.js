/* global QUnit */

import { Matrix4 } from '../../../../src/math/Matrix4';
import { Vector3 } from '../../../../src/math/Vector3';
import { Euler } from '../../../../src/math/Euler';
import { Quaternion } from '../../../../src/math/Quaternion';
import { MathUtils } from '../../../../src/math/MathUtils';
import { eps } from './Constants.tests';


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

// from Euler.js
function eulerEquals( a, b, tolerance ) {

	tolerance = tolerance || 0.0001;
	var diff = Math.abs( a.x - b.x ) + Math.abs( a.y - b.y ) + Math.abs( a.z - b.z );
	return ( diff < tolerance );

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Matrix4', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Matrix4();
			assert.ok( a.determinant() == 1, "Passed!" );

			var b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 4 );
			assert.ok( b.elements[ 2 ] == 8 );
			assert.ok( b.elements[ 3 ] == 12 );
			assert.ok( b.elements[ 4 ] == 1 );
			assert.ok( b.elements[ 5 ] == 5 );
			assert.ok( b.elements[ 6 ] == 9 );
			assert.ok( b.elements[ 7 ] == 13 );
			assert.ok( b.elements[ 8 ] == 2 );
			assert.ok( b.elements[ 9 ] == 6 );
			assert.ok( b.elements[ 10 ] == 10 );
			assert.ok( b.elements[ 11 ] == 14 );
			assert.ok( b.elements[ 12 ] == 3 );
			assert.ok( b.elements[ 13 ] == 7 );
			assert.ok( b.elements[ 14 ] == 11 );
			assert.ok( b.elements[ 15 ] == 15 );

			assert.ok( ! matrixEquals4( a, b ), "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.test( "isMatrix4", ( assert ) => {

			var a = new Matrix4();
			assert.ok( a.isMatrix4 === true, "Passed!" );

			var b = new Vector3();
			assert.ok( ! b.isMatrix4, "Passed!" );

		} );

		QUnit.test( "set", ( assert ) => {

			var b = new Matrix4();
			assert.ok( b.determinant() == 1, "Passed!" );

			b.set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 4 );
			assert.ok( b.elements[ 2 ] == 8 );
			assert.ok( b.elements[ 3 ] == 12 );
			assert.ok( b.elements[ 4 ] == 1 );
			assert.ok( b.elements[ 5 ] == 5 );
			assert.ok( b.elements[ 6 ] == 9 );
			assert.ok( b.elements[ 7 ] == 13 );
			assert.ok( b.elements[ 8 ] == 2 );
			assert.ok( b.elements[ 9 ] == 6 );
			assert.ok( b.elements[ 10 ] == 10 );
			assert.ok( b.elements[ 11 ] == 14 );
			assert.ok( b.elements[ 12 ] == 3 );
			assert.ok( b.elements[ 13 ] == 7 );
			assert.ok( b.elements[ 14 ] == 11 );
			assert.ok( b.elements[ 15 ] == 15 );

		} );

		QUnit.test( "identity", ( assert ) => {

			var b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 4 );
			assert.ok( b.elements[ 2 ] == 8 );
			assert.ok( b.elements[ 3 ] == 12 );
			assert.ok( b.elements[ 4 ] == 1 );
			assert.ok( b.elements[ 5 ] == 5 );
			assert.ok( b.elements[ 6 ] == 9 );
			assert.ok( b.elements[ 7 ] == 13 );
			assert.ok( b.elements[ 8 ] == 2 );
			assert.ok( b.elements[ 9 ] == 6 );
			assert.ok( b.elements[ 10 ] == 10 );
			assert.ok( b.elements[ 11 ] == 14 );
			assert.ok( b.elements[ 12 ] == 3 );
			assert.ok( b.elements[ 13 ] == 7 );
			assert.ok( b.elements[ 14 ] == 11 );
			assert.ok( b.elements[ 15 ] == 15 );

			var a = new Matrix4();
			assert.ok( ! matrixEquals4( a, b ), "Passed!" );

			b.identity();
			assert.ok( matrixEquals4( a, b ), "Passed!" );

		} );

		QUnit.test( "clone", ( assert ) => {

			var a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			var b = a.clone();

			assert.ok( matrixEquals4( a, b ), "Passed!" );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			assert.ok( ! matrixEquals4( a, b ), "Passed!" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			var b = new Matrix4().copy( a );

			assert.ok( matrixEquals4( a, b ), "Passed!" );

			// ensure that it is a true copy
			a.elements[ 0 ] = 2;
			assert.ok( ! matrixEquals4( a, b ), "Passed!" );

		} );

		QUnit.test( "copyPosition", ( assert ) => {

			var a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			var b = new Matrix4().set( 1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 16 );

			assert.notOk( matrixEquals4( a, b ), "a and b initially not equal" );

			b.copyPosition( a );
			assert.ok( matrixEquals4( a, b ), "a and b equal after copyPosition()" );

		} );

		QUnit.test( "makeBasis/extractBasis", ( assert ) => {

			var identityBasis = [ new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 0, 0, 1 ) ];
			var a = new Matrix4().makeBasis( identityBasis[ 0 ], identityBasis[ 1 ], identityBasis[ 2 ] );
			var identity = new Matrix4();
			assert.ok( matrixEquals4( a, identity ), "Passed!" );

			var testBases = [[ new Vector3( 0, 1, 0 ), new Vector3( - 1, 0, 0 ), new Vector3( 0, 0, 1 ) ]];
			for ( var i = 0; i < testBases.length; i ++ ) {

				var testBasis = testBases[ i ];
				var b = new Matrix4().makeBasis( testBasis[ 0 ], testBasis[ 1 ], testBasis[ 2 ] );
				var outBasis = [ new Vector3(), new Vector3(), new Vector3() ];
				b.extractBasis( outBasis[ 0 ], outBasis[ 1 ], outBasis[ 2 ] );
				// check what goes in, is what comes out.
				for ( var j = 0; j < outBasis.length; j ++ ) {

					assert.ok( outBasis[ j ].equals( testBasis[ j ] ), "Passed!" );

				}

				// get the basis out the hard war
				for ( var j = 0; j < identityBasis.length; j ++ ) {

					outBasis[ j ].copy( identityBasis[ j ] );
					outBasis[ j ].applyMatrix4( b );

				}
				// did the multiply method of basis extraction work?
				for ( var j = 0; j < outBasis.length; j ++ ) {

					assert.ok( outBasis[ j ].equals( testBasis[ j ] ), "Passed!" );

				}

			}

		} );

		QUnit.test( "makeRotationFromEuler/extractRotation", ( assert ) => {

			var testValues = [
				new Euler( 0, 0, 0, "XYZ" ),
				new Euler( 1, 0, 0, "XYZ" ),
				new Euler( 0, 1, 0, "ZYX" ),
				new Euler( 0, 0, 0.5, "YZX" ),
				new Euler( 0, 0, - 0.5, "YZX" )
			];

			for ( var i = 0; i < testValues.length; i ++ ) {

				var v = testValues[ i ];

				var m = new Matrix4().makeRotationFromEuler( v );

				var v2 = new Euler().setFromRotationMatrix( m, v.order );
				var m2 = new Matrix4().makeRotationFromEuler( v2 );

				assert.ok( matrixEquals4( m, m2, eps ), "makeRotationFromEuler #" + i + ": original and Euler-derived matrices are equal" );
				assert.ok( eulerEquals( v, v2, eps ), "makeRotationFromEuler #" + i + ": original and matrix-derived Eulers are equal" );

				var m3 = new Matrix4().extractRotation( m2 );
				var v3 = new Euler().setFromRotationMatrix( m3, v.order );

				assert.ok( matrixEquals4( m, m3, eps ), "extractRotation #" + i + ": original and extracted matrices are equal" );
				assert.ok( eulerEquals( v, v3, eps ), "extractRotation #" + i + ": original and extracted Eulers are equal" );

			}

		} );

		QUnit.test( "lookAt", ( assert ) => {

			var a = new Matrix4();
			var expected = new Matrix4().identity();
			var eye = new Vector3( 0, 0, 0 );
			var target = new Vector3( 0, 1, - 1 );
			var up = new Vector3( 0, 1, 0 );

			a.lookAt( eye, target, up );
			var rotation = new Euler().setFromRotationMatrix( a );
			assert.numEqual( rotation.x * ( 180 / Math.PI ), 45, "Check the rotation" );

			// eye and target are in the same position
			eye.copy( target );
			a.lookAt( eye, target, up );
			assert.ok( matrixEquals4( a, expected ), "Check the result for eye == target" );

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
			assert.ok( matrixEquals4( a, expected ), "Check the result for when up and z are parallel" );

		} );

		QUnit.test( "multiply", ( assert ) => {

			var lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			var rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );

			lhs.multiply( rhs );

			assert.ok( lhs.elements[ 0 ] == 1585 );
			assert.ok( lhs.elements[ 1 ] == 5318 );
			assert.ok( lhs.elements[ 2 ] == 10514 );
			assert.ok( lhs.elements[ 3 ] == 15894 );
			assert.ok( lhs.elements[ 4 ] == 1655 );
			assert.ok( lhs.elements[ 5 ] == 5562 );
			assert.ok( lhs.elements[ 6 ] == 11006 );
			assert.ok( lhs.elements[ 7 ] == 16634 );
			assert.ok( lhs.elements[ 8 ] == 1787 );
			assert.ok( lhs.elements[ 9 ] == 5980 );
			assert.ok( lhs.elements[ 10 ] == 11840 );
			assert.ok( lhs.elements[ 11 ] == 17888 );
			assert.ok( lhs.elements[ 12 ] == 1861 );
			assert.ok( lhs.elements[ 13 ] == 6246 );
			assert.ok( lhs.elements[ 14 ] == 12378 );
			assert.ok( lhs.elements[ 15 ] == 18710 );

		} );

		QUnit.test( "premultiply", ( assert ) => {

			var lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			var rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );

			rhs.premultiply( lhs );

			assert.ok( rhs.elements[ 0 ] == 1585 );
			assert.ok( rhs.elements[ 1 ] == 5318 );
			assert.ok( rhs.elements[ 2 ] == 10514 );
			assert.ok( rhs.elements[ 3 ] == 15894 );
			assert.ok( rhs.elements[ 4 ] == 1655 );
			assert.ok( rhs.elements[ 5 ] == 5562 );
			assert.ok( rhs.elements[ 6 ] == 11006 );
			assert.ok( rhs.elements[ 7 ] == 16634 );
			assert.ok( rhs.elements[ 8 ] == 1787 );
			assert.ok( rhs.elements[ 9 ] == 5980 );
			assert.ok( rhs.elements[ 10 ] == 11840 );
			assert.ok( rhs.elements[ 11 ] == 17888 );
			assert.ok( rhs.elements[ 12 ] == 1861 );
			assert.ok( rhs.elements[ 13 ] == 6246 );
			assert.ok( rhs.elements[ 14 ] == 12378 );
			assert.ok( rhs.elements[ 15 ] == 18710 );


		} );

		QUnit.test( "multiplyMatrices", ( assert ) => {

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
			var lhs = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			var rhs = new Matrix4().set( 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );
			var ans = new Matrix4();

			ans.multiplyMatrices( lhs, rhs );

			assert.ok( ans.elements[ 0 ] == 1585 );
			assert.ok( ans.elements[ 1 ] == 5318 );
			assert.ok( ans.elements[ 2 ] == 10514 );
			assert.ok( ans.elements[ 3 ] == 15894 );
			assert.ok( ans.elements[ 4 ] == 1655 );
			assert.ok( ans.elements[ 5 ] == 5562 );
			assert.ok( ans.elements[ 6 ] == 11006 );
			assert.ok( ans.elements[ 7 ] == 16634 );
			assert.ok( ans.elements[ 8 ] == 1787 );
			assert.ok( ans.elements[ 9 ] == 5980 );
			assert.ok( ans.elements[ 10 ] == 11840 );
			assert.ok( ans.elements[ 11 ] == 17888 );
			assert.ok( ans.elements[ 12 ] == 1861 );
			assert.ok( ans.elements[ 13 ] == 6246 );
			assert.ok( ans.elements[ 14 ] == 12378 );
			assert.ok( ans.elements[ 15 ] == 18710 );

		} );

		QUnit.test( "multiplyScalar", ( assert ) => {

			var b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			assert.ok( b.elements[ 0 ] == 0 );
			assert.ok( b.elements[ 1 ] == 4 );
			assert.ok( b.elements[ 2 ] == 8 );
			assert.ok( b.elements[ 3 ] == 12 );
			assert.ok( b.elements[ 4 ] == 1 );
			assert.ok( b.elements[ 5 ] == 5 );
			assert.ok( b.elements[ 6 ] == 9 );
			assert.ok( b.elements[ 7 ] == 13 );
			assert.ok( b.elements[ 8 ] == 2 );
			assert.ok( b.elements[ 9 ] == 6 );
			assert.ok( b.elements[ 10 ] == 10 );
			assert.ok( b.elements[ 11 ] == 14 );
			assert.ok( b.elements[ 12 ] == 3 );
			assert.ok( b.elements[ 13 ] == 7 );
			assert.ok( b.elements[ 14 ] == 11 );
			assert.ok( b.elements[ 15 ] == 15 );

			b.multiplyScalar( 2 );
			assert.ok( b.elements[ 0 ] == 0 * 2 );
			assert.ok( b.elements[ 1 ] == 4 * 2 );
			assert.ok( b.elements[ 2 ] == 8 * 2 );
			assert.ok( b.elements[ 3 ] == 12 * 2 );
			assert.ok( b.elements[ 4 ] == 1 * 2 );
			assert.ok( b.elements[ 5 ] == 5 * 2 );
			assert.ok( b.elements[ 6 ] == 9 * 2 );
			assert.ok( b.elements[ 7 ] == 13 * 2 );
			assert.ok( b.elements[ 8 ] == 2 * 2 );
			assert.ok( b.elements[ 9 ] == 6 * 2 );
			assert.ok( b.elements[ 10 ] == 10 * 2 );
			assert.ok( b.elements[ 11 ] == 14 * 2 );
			assert.ok( b.elements[ 12 ] == 3 * 2 );
			assert.ok( b.elements[ 13 ] == 7 * 2 );
			assert.ok( b.elements[ 14 ] == 11 * 2 );
			assert.ok( b.elements[ 15 ] == 15 * 2 );

		} );

		QUnit.test( "determinant", ( assert ) => {

			var a = new Matrix4();
			assert.ok( a.determinant() == 1, "Passed!" );

			a.elements[ 0 ] = 2;
			assert.ok( a.determinant() == 2, "Passed!" );

			a.elements[ 0 ] = 0;
			assert.ok( a.determinant() == 0, "Passed!" );

			// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
			a.set( 2, 3, 4, 5, - 1, - 21, - 3, - 4, 6, 7, 8, 10, - 8, - 9, - 10, - 12 );
			assert.ok( a.determinant() == 76, "Passed!" );

		} );

		QUnit.test( "transpose", ( assert ) => {

			var a = new Matrix4();
			var b = a.clone().transpose();
			assert.ok( matrixEquals4( a, b ), "Passed!" );

			var b = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			var c = b.clone().transpose();
			assert.ok( ! matrixEquals4( b, c ), "Passed!" );
			c.transpose();
			assert.ok( matrixEquals4( b, c ), "Passed!" );

		} );

		QUnit.test( "setPosition", ( assert ) => {

			var a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			var b = new Vector3( - 1, - 2, - 3 );
			var c = new Matrix4().set( 0, 1, 2, - 1, 4, 5, 6, - 2, 8, 9, 10, - 3, 12, 13, 14, 15 );

			a.setPosition( b );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "getInverse", ( assert ) => {

			var zero = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			var identity = new Matrix4();

			var a = new Matrix4();
			var b = new Matrix4().set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

			a.getInverse( b );
			assert.ok( matrixEquals4( a, zero ), "Passed!" );


			var testMatrices = [
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

			for ( var i = 0, il = testMatrices.length; i < il; i ++ ) {

				var m = testMatrices[ i ];

				var mInverse = new Matrix4().getInverse( m );
				var mSelfInverse = m.clone();
				mSelfInverse.getInverse( mSelfInverse );

				// self-inverse should the same as inverse
				assert.ok( matrixEquals4( mSelfInverse, mInverse ), "Passed!" );

				// the determinant of the inverse should be the reciprocal
				assert.ok( Math.abs( m.determinant() * mInverse.determinant() - 1 ) < 0.0001, "Passed!" );

				var mProduct = new Matrix4().multiplyMatrices( m, mInverse );

				// the determinant of the identity matrix is 1
				assert.ok( Math.abs( mProduct.determinant() - 1 ) < 0.0001, "Passed!" );
				assert.ok( matrixEquals4( mProduct, identity ), "Passed!" );

			}

		} );

		QUnit.test( "scale", ( assert ) => {

			var a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			var b = new Vector3( 2, 3, 4 );
			var c = new Matrix4().set( 2, 6, 12, 4, 10, 18, 28, 8, 18, 30, 44, 12, 26, 42, 60, 16 );

			a.scale( b );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "getMaxScaleOnAxis", ( assert ) => {

			var a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			var expected = Math.sqrt( 3 * 3 + 7 * 7 + 11 * 11 );

			assert.ok( Math.abs( a.getMaxScaleOnAxis() - expected ) <= eps, "Check result" );

		} );

		QUnit.test( "makeTranslation", ( assert ) => {

			var a = new Matrix4();
			var b = new Vector3( 2, 3, 4 );
			var c = new Matrix4().set( 1, 0, 0, 2, 0, 1, 0, 3, 0, 0, 1, 4, 0, 0, 0, 1 );

			a.makeTranslation( b.x, b.y, b.z );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "makeRotationX", ( assert ) => {

			var a = new Matrix4();
			var b = Math.sqrt( 3 ) / 2;
			var c = new Matrix4().set( 1, 0, 0, 0, 0, b, - 0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1 );

			a.makeRotationX( Math.PI / 6 );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "makeRotationY", ( assert ) => {


			var a = new Matrix4();
			var b = Math.sqrt( 3 ) / 2;
			var c = new Matrix4().set( b, 0, 0.5, 0, 0, 1, 0, 0, - 0.5, 0, b, 0, 0, 0, 0, 1 );

			a.makeRotationY( Math.PI / 6 );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "makeRotationZ", ( assert ) => {


			var a = new Matrix4();
			var b = Math.sqrt( 3 ) / 2;
			var c = new Matrix4().set( b, - 0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );

			a.makeRotationZ( Math.PI / 6 );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "makeRotationAxis", ( assert ) => {

			var axis = new Vector3( 1.5, 0.0, 1.0 ).normalize();
			var radians = MathUtils.degToRad( 45 );
			var a = new Matrix4().makeRotationAxis( axis, radians );

			var expected = new Matrix4().set(
				0.9098790095958609, - 0.39223227027636803, 0.13518148560620882, 0,
				0.39223227027636803, 0.7071067811865476, - 0.588348405414552, 0,
				0.13518148560620882, 0.588348405414552, 0.7972277715906868, 0,
				0, 0, 0, 1
			);

			assert.ok( matrixEquals4( a, expected ), "Check numeric result" );

		} );

		QUnit.test( "makeScale", ( assert ) => {

			var a = new Matrix4();
			var c = new Matrix4().set( 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1 );

			a.makeScale( 2, 3, 4 );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "makeShear", ( assert ) => {

			var a = new Matrix4();
			var c = new Matrix4().set( 1, 3, 4, 0, 2, 1, 4, 0, 2, 3, 1, 0, 0, 0, 0, 1 );

			a.makeShear( 2, 3, 4 );
			assert.ok( matrixEquals4( a, c ), "Passed!" );

		} );

		QUnit.test( "compose/decompose", ( assert ) => {

			var tValues = [
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

			var sValues = [
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

			var rValues = [
				new Quaternion(),
				new Quaternion().setFromEuler( new Euler( 1, 1, 0 ) ),
				new Quaternion().setFromEuler( new Euler( 1, - 1, 1 ) ),
				new Quaternion( 0, 0.9238795292366128, 0, 0.38268342717215614 )
			];

			for ( var ti = 0; ti < tValues.length; ti ++ ) {

				for ( var si = 0; si < sValues.length; si ++ ) {

					for ( var ri = 0; ri < rValues.length; ri ++ ) {

						var t = tValues[ ti ];
						var s = sValues[ si ];
						var r = rValues[ ri ];

						var m = new Matrix4().compose( t, r, s );
						var t2 = new Vector3();
						var r2 = new Quaternion();
						var s2 = new Vector3();

						m.decompose( t2, r2, s2 );

						var m2 = new Matrix4().compose( t2, r2, s2 );

						/*
						// debug code
						var matrixIsSame = matrixEquals4( m, m2 );
						if ( ! matrixIsSame ) {

							console.log( t, s, r );
							console.log( t2, s2, r2 );
							console.log( m, m2 );

						}
						*/

						assert.ok( matrixEquals4( m, m2 ), "Passed!" );

					}

				}

			}

		} );

		QUnit.test( "makePerspective", ( assert ) => {

			var a = new Matrix4().makePerspective( - 1, 1, - 1, 1, 1, 100 );
			var expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 101 / 99, - 200 / 99,
				0, 0, - 1, 0
			);
			assert.ok( matrixEquals4( a, expected ), "Check result" );

		} );

		QUnit.test( "makeOrthographic", ( assert ) => {

			var a = new Matrix4().makeOrthographic( - 1, 1, - 1, 1, 1, 100 );
			var expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 2 / 99, - 101 / 99,
				0, 0, 0, 1
			);

			assert.ok( matrixEquals4( a, expected ), "Check result" );

		} );

		QUnit.test( "equals", ( assert ) => {

			var a = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			var b = new Matrix4().set( 0, - 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );

			assert.notOk( a.equals( b ), "Check that a does not equal b" );
			assert.notOk( b.equals( a ), "Check that b does not equal a" );

			a.copy( b );
			assert.ok( a.equals( b ), "Check that a equals b after copy()" );
			assert.ok( b.equals( a ), "Check that b equals a after copy()" );

		} );

		QUnit.test( "fromArray", ( assert ) => {

			var a = new Matrix4();
			var b = new Matrix4().set( 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 );

			a.fromArray( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ] );
			assert.ok( a.equals( b ), "Passed" );

		} );

		QUnit.test( "toArray", ( assert ) => {

			var a = new Matrix4().set( 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 );
			var noOffset = [ 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ];
			var withOffset = [ undefined, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16 ];

			var array = a.toArray();
			assert.deepEqual( array, noOffset, "No array, no offset" );

			var array = [];
			a.toArray( array );
			assert.deepEqual( array, noOffset, "With array, no offset" );

			var array = [];
			a.toArray( array, 1 );
			assert.deepEqual( array, withOffset, "With array, with offset" );

		} );

	} );

} );
