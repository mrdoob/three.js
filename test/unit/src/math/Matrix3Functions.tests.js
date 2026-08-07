import {
	mat3Copy,
	mat3Create,
	mat3Determinant,
	mat3Equals,
	mat3FromArray,
	mat3GetNormalMatrix,
	mat3Identity,
	mat3Invert,
	mat3MakeRotation,
	mat3MakeScale,
	mat3MakeTranslation,
	mat3Multiply,
	mat3MultiplyMatrices,
	mat3MultiplyScalar,
	mat3PreMultiply,
	mat3Set,
	mat3SetFromMatrix4,
	mat3SetUvTransform,
	mat3ToArray,
	mat3Transpose
} from '../../../../src/math/Matrix3Functions.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { eps } from '../../utils/math-constants.js';

function matrixLikeEquals( a, b, tolerance = eps ) {

	const ae = a.elements;
	const be = b.elements;

	if ( ae.length !== be.length ) return false;

	for ( let i = 0, il = ae.length; i < il; i ++ ) {

		if ( Math.abs( ae[ i ] - be[ i ] ) > tolerance ) return false;

	}

	return true;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Matrix3Functions', () => {

		QUnit.test( 'mat3Create is a plain Matrix3Like, not a Matrix3 instance', ( assert ) => {

			const m = mat3Create();

			assert.ok( Array.isArray( m.elements ), 'has an elements array' );
			assert.strictEqual( m.elements.length, 9, 'has 9 elements' );
			assert.notOk( m.isMatrix3, 'is not branded as a Matrix3' );
			assert.ok( mat3Equals( m, new Matrix3() ), 'is numerically an identity matrix' );

		} );

		QUnit.test( 'operations work on plain objects without importing Matrix3', ( assert ) => {

			const a = mat3Set( mat3Create(), 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const b = mat3Set( mat3Create(), 29, 31, 37, 41, 43, 47, 53, 59, 61 );

			const product = mat3MultiplyMatrices( a, b );

			assert.ok( ! product.isMatrix3, 'result is a plain Matrix3Like' );
			assert.ok( matrixLikeEquals( product, new Matrix3().copy( a ).multiply( new Matrix3().copy( b ) ) ), 'matches the class result' );

		} );

		QUnit.test( 'operations work on typed-array-backed Matrix3Like objects', ( assert ) => {

			const identity = { elements: new Float32Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] ) };
			const translation = mat3MakeTranslation( 2, 3, { elements: new Float32Array( 9 ) } );

			assert.ok( translation.elements instanceof Float32Array, 'target stays a typed array' );
			assert.ok( matrixLikeEquals( translation, new Matrix3().makeTranslation( 2, 3 ) ), 'matches the class result' );
			assert.ok( mat3Equals( identity, new Matrix3() ), 'typed-array identity compares equal to a class identity' );

		} );

		QUnit.test( 'omitting the target allocates a new Matrix3Like, providing one reuses it', ( assert ) => {

			const source = new Matrix3().set( 0, 1, 2, 3, 4, 5, 6, 7, 8 );

			const allocated = mat3Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( matrixLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = mat3Create();
			const returned = mat3Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( matrixLikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'multiplyMatrices is safe when the target aliases either input', ( assert ) => {

			const a = mat3Set( mat3Create(), 2, 3, 5, 7, 11, 13, 17, 19, 23 );
			const b = mat3Set( mat3Create(), 29, 31, 37, 41, 43, 47, 53, 59, 61 );
			const expected = mat3MultiplyMatrices( a, b );

			const aliasA = mat3Copy( a );
			mat3MultiplyMatrices( aliasA, b, aliasA );
			assert.ok( matrixLikeEquals( aliasA, expected ), 'target aliasing the first argument produces the correct result' );

			const aliasB = mat3Copy( b );
			mat3MultiplyMatrices( a, aliasB, aliasB );
			assert.ok( matrixLikeEquals( aliasB, expected ), 'target aliasing the second argument produces the correct result' );

		} );

		QUnit.test( 'invert is safe when the target aliases the input, and handles singular matrices', ( assert ) => {

			const m = mat3MakeRotation( 0.4 );
			const expected = mat3Invert( m );

			const aliased = mat3Copy( m );
			mat3Invert( aliased, aliased );
			assert.ok( matrixLikeEquals( aliased, expected ), 'in-place invert matches out-of-place invert' );

			const singular = mat3Set( mat3Create(), 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			const zero = mat3Invert( singular );
			assert.ok( mat3Equals( zero, { elements: new Array( 9 ).fill( 0 ) } ), 'a singular matrix inverts to a zero matrix' );

		} );

		QUnit.test( 'transpose is safe when the target aliases the input', ( assert ) => {

			const m = mat3Set( mat3Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const expected = mat3Transpose( m );

			const aliased = mat3Copy( m );
			mat3Transpose( aliased, aliased );
			assert.ok( matrixLikeEquals( aliased, expected ), 'in-place transpose matches out-of-place transpose' );

		} );

		QUnit.test( 'multiply/preMultiply match the class multiply/premultiply argument order', ( assert ) => {

			const a = mat3MakeTranslation( 1, 0 );
			const b = mat3MakeRotation( Math.PI / 3 );

			const postMultiplied = mat3Multiply( a, b );
			const classPost = new Matrix3().copy( a ).multiply( new Matrix3().copy( b ) );
			assert.ok( matrixLikeEquals( postMultiplied, classPost ), 'mat3Multiply matches Matrix3#multiply' );

			const preMultiplied = mat3PreMultiply( a, b );
			const classPre = new Matrix3().copy( a ).premultiply( new Matrix3().copy( b ) );
			assert.ok( matrixLikeEquals( preMultiplied, classPre ), 'mat3PreMultiply matches Matrix3#premultiply' );

		} );

		QUnit.test( 'multiplyScalar', ( assert ) => {

			const m = mat3Set( mat3Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			const scaled = mat3MultiplyScalar( m, 2 );

			for ( let i = 0; i < 9; i ++ ) {

				assert.strictEqual( scaled.elements[ i ], m.elements[ i ] * 2 );

			}

		} );

		QUnit.test( 'determinant matches the class implementation', ( assert ) => {

			const m = mat3Set( mat3Create(), 2, 3, 4, - 1, - 21, - 3, 6, 7, 8 );
			const classM = new Matrix3().set( 2, 3, 4, - 1, - 21, - 3, 6, 7, 8 );

			assert.strictEqual( mat3Determinant( m ), classM.determinant() );

		} );

		QUnit.test( 'setFromMatrix4 / getNormalMatrix match the class', ( assert ) => {

			const m4 = new Matrix4().makeRotationX( 0.5 ).setPosition( 1, 2, 3 );

			const from4 = mat3SetFromMatrix4( m4 );
			assert.ok( matrixLikeEquals( from4, new Matrix3().setFromMatrix4( m4 ) ), 'setFromMatrix4 matches the class' );

			const normal = mat3GetNormalMatrix( m4 );
			assert.ok( matrixLikeEquals( normal, new Matrix3().getNormalMatrix( m4 ) ), 'getNormalMatrix matches the class' );

		} );

		QUnit.test( 'makeTranslation accepts a Vector2-like object', ( assert ) => {

			const fromComponents = mat3MakeTranslation( 2, 3 );
			const fromVector = mat3MakeTranslation( { x: 2, y: 3, isVector2: true } );

			assert.ok( mat3Equals( fromComponents, fromVector ), 'vector overload matches component overload' );

		} );

		QUnit.test( 'setUvTransform matches the class', ( assert ) => {

			const functional = mat3SetUvTransform( 0.1, 0.2, 1.5, 2.5, Math.PI / 6, 0.5, 0.5 );
			const classResult = new Matrix3().setUvTransform( 0.1, 0.2, 1.5, 2.5, Math.PI / 6, 0.5, 0.5 );

			assert.ok( matrixLikeEquals( functional, classResult ), 'setUvTransform matches the class' );

		} );

		QUnit.test( 'makeScale matches the class', ( assert ) => {

			assert.ok( matrixLikeEquals( mat3MakeScale( 2, 3 ), new Matrix3().makeScale( 2, 3 ) ) );

		} );

		QUnit.test( 'fromArray / toArray support non-zero offsets', ( assert ) => {

			const array = [ 999, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
			const m = mat3FromArray( array, 1 );

			assert.ok( mat3Equals( m, new Matrix3().fromArray( array, 1 ) ), 'fromArray with an offset matches the class' );

			const out = [ undefined ];
			mat3ToArray( m, out, 1 );

			assert.deepEqual( out, new Matrix3().fromArray( array, 1 ).toArray( [ undefined ], 1 ), 'toArray with an offset matches the class' );

		} );

		QUnit.test( 'identity / set round-trip', ( assert ) => {

			const m = mat3Set( mat3Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8 );
			assert.notOk( mat3Equals( m, mat3Create() ), 'the matrix is not the identity after set()' );

			mat3Identity( m );
			assert.ok( mat3Equals( m, mat3Create() ), 'identity() resets the matrix' );

		} );

	} );

} );
