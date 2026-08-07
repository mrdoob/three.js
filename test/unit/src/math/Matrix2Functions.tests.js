import {
	mat2Create,
	mat2FromArray,
	mat2Identity,
	mat2Set
} from '../../../../src/math/Matrix2Functions.js';
import { Matrix2 } from '../../../../src/math/Matrix2.js';

function matrixLikeEquals( a, b ) {

	const ae = a.elements;
	const be = b.elements;

	if ( ae.length !== be.length ) return false;

	for ( let i = 0, il = ae.length; i < il; i ++ ) {

		if ( ae[ i ] !== be[ i ] ) return false;

	}

	return true;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Matrix2Functions', () => {

		QUnit.test( 'mat2Create is a plain Matrix2Like, not a Matrix2 instance', ( assert ) => {

			const m = mat2Create();

			assert.ok( Array.isArray( m.elements ), 'has an elements array' );
			assert.strictEqual( m.elements.length, 4, 'has 4 elements' );
			assert.notOk( m.isMatrix2, 'is not branded as a Matrix2' );
			assert.ok( matrixLikeEquals( m, new Matrix2() ), 'is numerically an identity matrix' );

		} );

		QUnit.test( 'operations work on plain objects without importing Matrix2', ( assert ) => {

			const a = mat2Set( mat2Create(), 11, 12, 21, 22 );

			assert.ok( ! a.isMatrix2, 'result is a plain Matrix2Like' );
			assert.deepEqual( a.elements, [ 11, 21, 12, 22 ], 'stores in column-major order' );

			const identity = mat2Identity();
			assert.ok( ! identity.isMatrix2, 'identity result is a plain Matrix2Like' );
			assert.deepEqual( identity.elements, [ 1, 0, 0, 1 ], 'identity has correct elements' );

			const fromArray = mat2FromArray( [ 9, 8, 7, 6, 5 ], 1 );
			assert.ok( ! fromArray.isMatrix2, 'fromArray result is a plain Matrix2Like' );
			assert.deepEqual( fromArray.elements, [ 8, 7, 6, 5 ], 'reads column-major values with offset' );

		} );

		QUnit.test( 'operations work on typed-array-backed Matrix2Like objects', ( assert ) => {

			const identity = { elements: new Float32Array( [ 1, 0, 0, 1 ] ) };
			const target = { elements: new Float32Array( 4 ) };

			mat2Set( target, 11, 12, 21, 22 );

			assert.ok( target.elements instanceof Float32Array, 'target stays a typed array' );
			assert.deepEqual( Array.from( target.elements ), [ 11, 21, 12, 22 ], 'matches the expected column-major values' );
			assert.ok( matrixLikeEquals( identity, new Matrix2() ), 'typed-array identity compares equal to a class identity' );

		} );

		QUnit.test( 'omitting the target allocates a new Matrix2Like, providing one reuses it', ( assert ) => {

			const allocated = mat2Identity();
			assert.ok( Array.isArray( allocated.elements ), 'a new object is allocated' );
			assert.deepEqual( allocated.elements, [ 1, 0, 0, 1 ], 'the allocated identity is correct' );

			const reused = mat2Create();
			reused.elements[ 0 ] = 9;
			const returned = mat2Identity( reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.deepEqual( reused.elements, [ 1, 0, 0, 1 ], 'the provided target holds the result' );

			const arrayTarget = mat2Create();
			const fromArrayReturned = mat2FromArray( [ 1, 2, 3, 4 ], 0, arrayTarget );
			assert.strictEqual( fromArrayReturned, arrayTarget, 'fromArray reuses the provided target' );
			assert.deepEqual( arrayTarget.elements, [ 1, 2, 3, 4 ], 'fromArray writes into the provided target' );

		} );

		QUnit.test( 'mat2Set and mat2FromArray match Matrix2 class behavior', ( assert ) => {

			const functional = mat2Set( mat2Create(), 11, 12, 21, 22 );
			const klass = new Matrix2().set( 11, 12, 21, 22 );
			assert.ok( matrixLikeEquals( functional, klass ), 'mat2Set matches Matrix2#set' );

			const functionalFromArray = mat2FromArray( [ 0, 1, 2, 3, 4 ], 1 );
			const classFromArray = new Matrix2().fromArray( [ 0, 1, 2, 3, 4 ], 1 );
			assert.ok( matrixLikeEquals( functionalFromArray, classFromArray ), 'mat2FromArray matches Matrix2#fromArray' );

			const functionalIdentity = mat2Identity( mat2Set( mat2Create(), 11, 12, 21, 22 ) );
			const classIdentity = new Matrix2().set( 11, 12, 21, 22 ).identity();
			assert.ok( matrixLikeEquals( functionalIdentity, classIdentity ), 'mat2Identity matches Matrix2#identity' );

		} );

	} );

} );
