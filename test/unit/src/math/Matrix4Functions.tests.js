import {
	mat4Compose,
	mat4Copy,
	mat4Create,
	mat4Decompose,
	mat4Determinant,
	mat4DeterminantAffine,
	mat4Equals,
	mat4ExtractRotation,
	mat4FromArray,
	mat4Identity,
	mat4Invert,
	mat4LookAt,
	mat4MakeOrthographic,
	mat4MakePerspective,
	mat4MakeRotationX,
	mat4MakeScale,
	mat4MakeTranslation,
	mat4Multiply,
	mat4MultiplyMatrices,
	mat4MultiplyScalar,
	mat4PreMultiply,
	mat4Scale,
	mat4Set,
	mat4ToArray,
	mat4Transpose
} from '../../../../src/math/Matrix4Functions.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Euler } from '../../../../src/math/Euler.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../../../src/constants.js';
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

	QUnit.module( 'Matrix4Functions', () => {

		QUnit.test( 'mat4Create is a plain Matrix4Like, not a Matrix4 instance', ( assert ) => {

			const m = mat4Create();

			assert.ok( Array.isArray( m.elements ), 'has an elements array' );
			assert.strictEqual( m.elements.length, 16, 'has 16 elements' );
			assert.notOk( m.isMatrix4, 'is not branded as a Matrix4' );
			assert.ok( mat4Equals( m, new Matrix4() ), 'is numerically an identity matrix' );

		} );

		QUnit.test( 'operations work on plain objects without importing Matrix4', ( assert ) => {

			const a = mat4Set( mat4Create(), 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const b = mat4Set( mat4Create(), 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );

			const product = mat4MultiplyMatrices( a, b );

			assert.ok( ! product.isMatrix4, 'result is a plain Matrix4Like' );
			assert.ok( matrixLikeEquals( product, new Matrix4().copy( a ).multiply( new Matrix4().copy( b ) ) ), 'matches the class result' );

		} );

		QUnit.test( 'operations work on typed-array-backed Matrix4Like objects', ( assert ) => {

			const identity = { elements: new Float32Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ) };
			const translation = mat4MakeTranslation( 2, 3, 4, { elements: new Float32Array( 16 ) } );

			assert.ok( translation.elements instanceof Float32Array, 'target stays a typed array' );
			assert.ok( matrixLikeEquals( translation, new Matrix4().makeTranslation( 2, 3, 4 ) ), 'matches the class result' );
			assert.ok( mat4Equals( identity, new Matrix4() ), 'typed-array identity compares equal to a class identity' );

		} );

		QUnit.test( 'omitting the target allocates a new Matrix4Like, providing one reuses it', ( assert ) => {

			const source = new Matrix4().set( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );

			const allocated = mat4Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( matrixLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = mat4Create();
			const returned = mat4Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( matrixLikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'multiplyMatrices is safe when the target aliases either input', ( assert ) => {

			const a = mat4Set( mat4Create(), 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const b = mat4Set( mat4Create(), 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131 );
			const expected = mat4MultiplyMatrices( a, b );

			const aliasA = mat4Copy( a );
			mat4MultiplyMatrices( aliasA, b, aliasA );
			assert.ok( matrixLikeEquals( aliasA, expected ), 'target aliasing the first argument produces the correct result' );

			const aliasB = mat4Copy( b );
			mat4MultiplyMatrices( a, aliasB, aliasB );
			assert.ok( matrixLikeEquals( aliasB, expected ), 'target aliasing the second argument produces the correct result' );

		} );

		QUnit.test( 'invert is safe when the target aliases the input, and handles singular matrices', ( assert ) => {

			const m = mat4MakeRotationX( 0.4 );
			const expected = mat4Invert( m );

			const aliased = mat4Copy( m );
			mat4Invert( aliased, aliased );
			assert.ok( matrixLikeEquals( aliased, expected ), 'in-place invert matches out-of-place invert' );

			const singular = mat4Set( mat4Create(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );
			const zero = mat4Invert( singular );
			assert.ok( mat4Equals( zero, { elements: new Array( 16 ).fill( 0 ) } ), 'a singular matrix inverts to a zero matrix' );

		} );

		QUnit.test( 'transpose is safe when the target aliases the input', ( assert ) => {

			const m = mat4Set( mat4Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const expected = mat4Transpose( m );

			const aliased = mat4Copy( m );
			mat4Transpose( aliased, aliased );
			assert.ok( matrixLikeEquals( aliased, expected ), 'in-place transpose matches out-of-place transpose' );

		} );

		QUnit.test( 'scale is safe when the target aliases the input and preserves the translation column', ( assert ) => {

			const m = mat4MakeTranslation( 5, 6, 7 );
			const v = new Vector3( 2, 3, 4 );

			const scaled = mat4Scale( m, v, mat4Copy( m ) );
			assert.strictEqual( scaled.elements[ 12 ], 5, 'x translation is preserved' );
			assert.strictEqual( scaled.elements[ 13 ], 6, 'y translation is preserved' );
			assert.strictEqual( scaled.elements[ 14 ], 7, 'z translation is preserved' );

		} );

		QUnit.test( 'multiply/preMultiply match the class multiply/premultiply argument order', ( assert ) => {

			const a = mat4MakeTranslation( 1, 0, 0 );
			const b = mat4MakeRotationX( Math.PI / 3 );

			const postMultiplied = mat4Multiply( a, b );
			const classPost = new Matrix4().copy( a ).multiply( new Matrix4().copy( b ) );
			assert.ok( matrixLikeEquals( postMultiplied, classPost ), 'mat4Multiply matches Matrix4#multiply' );

			const preMultiplied = mat4PreMultiply( a, b );
			const classPre = new Matrix4().copy( a ).premultiply( new Matrix4().copy( b ) );
			assert.ok( matrixLikeEquals( preMultiplied, classPre ), 'mat4PreMultiply matches Matrix4#premultiply' );

		} );

		QUnit.test( 'multiplyScalar', ( assert ) => {

			const m = mat4Set( mat4Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			const scaled = mat4MultiplyScalar( m, 2 );

			for ( let i = 0; i < 16; i ++ ) {

				assert.strictEqual( scaled.elements[ i ], m.elements[ i ] * 2 );

			}

		} );

		QUnit.test( 'determinant / determinantAffine match the class implementations', ( assert ) => {

			const m = mat4Set( mat4Create(), 2, 3, 4, 5, - 1, - 21, - 3, - 4, 6, 7, 8, 10, - 8, - 9, - 10, - 12 );
			const classM = new Matrix4().set( 2, 3, 4, 5, - 1, - 21, - 3, - 4, 6, 7, 8, 10, - 8, - 9, - 10, - 12 );

			assert.strictEqual( mat4Determinant( m ), classM.determinant() );

			const perspective = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100 );
			const classPerspective = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100 );

			assert.strictEqual( mat4DeterminantAffine( perspective ), classPerspective.determinantAffine() );

		} );

		QUnit.test( 'extractRotation handles the singular (determinant zero) case', ( assert ) => {

			const singular = mat4MakeScale( 0, 1, 1 );
			const rotation = mat4ExtractRotation( singular );

			assert.ok( mat4Equals( rotation, new Matrix4() ), 'a singular affine matrix extracts to the identity' );

		} );

		QUnit.test( 'decompose handles the singular (determinant zero) case', ( assert ) => {

			const singular = mat4MakeScale( 0, 1, 1 );
			const position = new Vector3();
			const quaternion = new Quaternion( 1, 2, 3, 4 );
			const scale = new Vector3();

			mat4Decompose( singular, position, quaternion, scale );

			assert.ok( scale.equals( new Vector3( 1, 1, 1 ) ), 'scale defaults to (1,1,1)' );
			assert.ok( quaternion.equals( new Quaternion() ), 'quaternion defaults to identity' );

		} );

		QUnit.test( 'compose/decompose round-trip using real Vector3/Quaternion instances', ( assert ) => {

			const position = new Vector3( 3, - 5, 7 );
			const quaternion = new Quaternion().setFromEuler( new Euler( 0.3, - 0.6, 0.9, 'XYZ' ) );
			const scale = new Vector3( 2, 0.5, 1.5 );

			const m = mat4Compose( position, quaternion, scale );

			const position2 = new Vector3();
			const quaternion2 = new Quaternion();
			const scale2 = new Vector3();

			mat4Decompose( m, position2, quaternion2, scale2 );

			assert.ok( position.distanceTo( position2 ) < eps, 'position round-trips' );
			assert.ok( scale.distanceTo( scale2 ) < eps, 'scale round-trips' );
			assert.ok( Math.abs( quaternion.x - quaternion2.x ) < eps &&
				Math.abs( quaternion.y - quaternion2.y ) < eps &&
				Math.abs( quaternion.z - quaternion2.z ) < eps &&
				Math.abs( quaternion.w - quaternion2.w ) < eps, 'quaternion round-trips' );

		} );

		QUnit.test( 'lookAt degenerate cases match the class implementation', ( assert ) => {

			const eye = new Vector3( 0, 1, 0 );
			const target = new Vector3( 0, 0, 0 );
			const up = new Vector3( 0, 1, 0 );

			const functional = mat4LookAt( eye, target, up );
			const classResult = new Matrix4().lookAt( eye, target, up );

			assert.ok( matrixLikeEquals( functional, classResult ), 'up-parallel-to-z case matches the class' );

			const sameEye = new Vector3( 1, 2, 3 );
			const sameTarget = new Vector3( 1, 2, 3 );

			const functionalSame = mat4LookAt( sameEye, sameTarget, up );
			const classSame = new Matrix4().lookAt( sameEye, sameTarget, up );

			assert.ok( matrixLikeEquals( functionalSame, classSame ), 'eye-equals-target case matches the class' );

		} );

		QUnit.test( 'makePerspective supports WebGPU coordinate system and reversed depth', ( assert ) => {

			const webgpu = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100, WebGPUCoordinateSystem );
			const classWebgpu = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100, WebGPUCoordinateSystem );
			assert.ok( matrixLikeEquals( webgpu, classWebgpu ), 'WebGPU coordinate system matches the class' );

			const reversed = mat4MakePerspective( - 1, 1, 1, - 1, 1, 100, WebGLCoordinateSystem, true );
			const classReversed = new Matrix4().makePerspective( - 1, 1, 1, - 1, 1, 100, WebGLCoordinateSystem, true );
			assert.ok( matrixLikeEquals( reversed, classReversed ), 'reversed depth matches the class' );

			assert.throws( () => mat4MakePerspective( - 1, 1, 1, - 1, 1, 100, 'invalid' ), 'throws on an invalid coordinate system' );

		} );

		QUnit.test( 'makeOrthographic supports WebGPU coordinate system and reversed depth', ( assert ) => {

			const webgpu = mat4MakeOrthographic( - 1, 1, 1, - 1, 1, 100, WebGPUCoordinateSystem );
			const classWebgpu = new Matrix4().makeOrthographic( - 1, 1, 1, - 1, 1, 100, WebGPUCoordinateSystem );
			assert.ok( matrixLikeEquals( webgpu, classWebgpu ), 'WebGPU coordinate system matches the class' );

			const reversed = mat4MakeOrthographic( - 1, 1, 1, - 1, 1, 100, WebGLCoordinateSystem, true );
			const classReversed = new Matrix4().makeOrthographic( - 1, 1, 1, - 1, 1, 100, WebGLCoordinateSystem, true );
			assert.ok( matrixLikeEquals( reversed, classReversed ), 'reversed depth matches the class' );

			assert.throws( () => mat4MakeOrthographic( - 1, 1, 1, - 1, 1, 100, 'invalid' ), 'throws on an invalid coordinate system' );

		} );

		QUnit.test( 'fromArray / toArray support non-zero offsets', ( assert ) => {

			const array = [ 999, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];
			const m = mat4FromArray( array, 1 );

			assert.ok( mat4Equals( m, new Matrix4().fromArray( array, 1 ) ), 'fromArray with an offset matches the class' );

			const out = [ undefined ];
			mat4ToArray( m, out, 1 );

			assert.deepEqual( out, new Matrix4().fromArray( array, 1 ).toArray( [ undefined ], 1 ), 'toArray with an offset matches the class' );

		} );

		QUnit.test( 'identity / set round-trip', ( assert ) => {

			const m = mat4Set( mat4Create(), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 );
			assert.notOk( mat4Equals( m, mat4Create() ), 'the matrix is not the identity after set()' );

			mat4Identity( m );
			assert.ok( mat4Equals( m, mat4Create() ), 'identity() resets the matrix' );

		} );

	} );

} );
