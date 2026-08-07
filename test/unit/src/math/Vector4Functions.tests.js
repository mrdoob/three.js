import {
	vec4Add,
	vec4AddScalar,
	vec4AddVectors,
	vec4ApplyMatrix4,
	vec4ClampLength,
	vec4Copy,
	vec4Create,
	vec4Divide,
	vec4Dot,
	vec4Equals,
	vec4FromArray,
	vec4Length,
	vec4Lerp,
	vec4Multiply,
	vec4MultiplyScalar,
	vec4Normalize,
	vec4Set,
	vec4SetAxisAngleFromQuaternion,
	vec4SetAxisAngleFromRotationMatrix,
	vec4SetFromMatrixPosition,
	vec4Sub,
	vec4ToArray
} from '../../../../src/math/Vector4Functions.js';
import { Vector4 } from '../../../../src/math/Vector4.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { eps } from '../../utils/math-constants.js';

function vector4LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance &&
		Math.abs( a.w - b.w ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector4Functions', () => {

		QUnit.test( 'vec4Create is a plain Vector4Like, not a Vector4 instance', ( assert ) => {

			const v = vec4Create();

			assert.strictEqual( v.x, 0, 'default x' );
			assert.strictEqual( v.y, 0, 'default y' );
			assert.strictEqual( v.z, 0, 'default z' );
			assert.strictEqual( v.w, 1, 'default w' );
			assert.notOk( v.isVector4, 'is not branded as a Vector4' );
			assert.ok( vec4Equals( v, new Vector4() ), 'matches new Vector4()' );

		} );

		QUnit.test( 'operations work on plain objects without importing Vector4', ( assert ) => {

			const a = vec4Set( 1, 2, 3, 4 );
			const b = vec4Set( 5, 6, 7, 8 );

			const sum = vec4Add( a, b );
			const product = vec4Multiply( a, b );
			const normalized = vec4Normalize( a );

			assert.ok( ! sum.isVector4, 'add result is a plain Vector4Like' );
			assert.ok( vector4LikeEquals( sum, { x: 6, y: 8, z: 10, w: 12 } ), 'add matches expected' );
			assert.ok( vector4LikeEquals( product, { x: 5, y: 12, z: 21, w: 32 } ), 'multiply matches expected' );
			assert.ok( Math.abs( vec4Length( normalized ) - 1 ) <= eps, 'normalize produces unit length' );
			assert.strictEqual( vec4Dot( a, b ), 70, 'dot matches expected' );

		} );

		QUnit.test( 'omitting the target allocates a new Vector4Like, providing one reuses it', ( assert ) => {

			const source = { x: 1, y: 2, z: 3, w: 4 };

			const allocated = vec4Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( vector4LikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = vec4Create();
			const returned = vec4Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( vector4LikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'add/sub/multiply/divide are safe when the target aliases an input', ( assert ) => {

			const a = vec4Set( 1, 2, 3, 4 );
			const b = vec4Set( 5, 6, 7, 8 );
			const expectedAdd = vec4Add( a, b );
			const expectedSub = vec4Sub( a, b );
			const expectedMul = vec4Multiply( a, b );
			const expectedDiv = vec4Divide( a, b );

			const aliasAdd = vec4Copy( a );
			vec4Add( aliasAdd, b, aliasAdd );
			assert.ok( vector4LikeEquals( aliasAdd, expectedAdd ), 'in-place add is safe' );

			const aliasSub = vec4Copy( a );
			vec4Sub( aliasSub, b, aliasSub );
			assert.ok( vector4LikeEquals( aliasSub, expectedSub ), 'in-place sub is safe' );

			const aliasMul = vec4Copy( a );
			vec4Multiply( aliasMul, b, aliasMul );
			assert.ok( vector4LikeEquals( aliasMul, expectedMul ), 'in-place multiply is safe' );

			const aliasDiv = vec4Copy( a );
			vec4Divide( aliasDiv, b, aliasDiv );
			assert.ok( vector4LikeEquals( aliasDiv, expectedDiv ), 'in-place divide is safe' );

		} );

		QUnit.test( 'applyMatrix4 is safe when the target aliases the input', ( assert ) => {

			const v = vec4Set( 1, 2, 3, 1 );
			const m = new Matrix4().makeTranslation( 10, 20, 30 );
			const expected = vec4ApplyMatrix4( v, m );

			const aliased = vec4Copy( v );
			vec4ApplyMatrix4( aliased, m, aliased );
			assert.ok( vector4LikeEquals( aliased, expected ), 'in-place applyMatrix4 matches out-of-place' );
			assert.ok( vector4LikeEquals( expected, new Vector4( 1, 2, 3, 1 ).applyMatrix4( m ) ), 'matches the class result' );

		} );

		QUnit.test( 'normalize and clampLength handle the zero-length case', ( assert ) => {

			const zero = vec4Set( 0, 0, 0, 0 );
			const normalized = vec4Normalize( zero );

			assert.ok( vector4LikeEquals( normalized, { x: 0, y: 0, z: 0, w: 0 } ), 'normalizing zero stays zero' );
			assert.ok( vector4LikeEquals( vec4Normalize( zero ), new Vector4( 0, 0, 0, 0 ).normalize() ), 'matches the class' );

			const clamped = vec4ClampLength( zero, 1, 2 );
			assert.ok( vector4LikeEquals( clamped, new Vector4( 0, 0, 0, 0 ).clampLength( 1, 2 ) ), 'clampLength on zero matches the class' );

		} );

		QUnit.test( 'setAxisAngleFromQuaternion matches the class for identity and non-trivial cases', ( assert ) => {

			const identity = { x: 0, y: 0, z: 0, w: 1 };
			const functionalIdentity = vec4SetAxisAngleFromQuaternion( identity );
			const classIdentity = new Vector4().setAxisAngleFromQuaternion( new Quaternion() );

			assert.ok( vector4LikeEquals( functionalIdentity, classIdentity ), 'identity quaternion matches the class' );

			const q = new Quaternion().setFromAxisAngle( { x: 0, y: 1, z: 0 }, Math.PI / 3 );
			const functional = vec4SetAxisAngleFromQuaternion( q );
			const classResult = new Vector4().setAxisAngleFromQuaternion( q );

			assert.ok( vector4LikeEquals( functional, classResult ), 'non-trivial quaternion matches the class' );

		} );

		QUnit.test( 'setAxisAngleFromRotationMatrix matches the class for identity and 180-degree singularities', ( assert ) => {

			const identity = new Matrix4();
			assert.ok( vector4LikeEquals(
				vec4SetAxisAngleFromRotationMatrix( identity ),
				new Vector4().setAxisAngleFromRotationMatrix( identity )
			), 'identity rotation matches the class' );

			const flipX = new Matrix4().makeRotationX( Math.PI );
			assert.ok( vector4LikeEquals(
				vec4SetAxisAngleFromRotationMatrix( flipX ),
				new Vector4().setAxisAngleFromRotationMatrix( flipX )
			), '180-degree X rotation matches the class' );

			const general = new Matrix4().makeRotationY( 0.7 );
			assert.ok( vector4LikeEquals(
				vec4SetAxisAngleFromRotationMatrix( general ),
				new Vector4().setAxisAngleFromRotationMatrix( general )
			), 'general rotation matches the class' );

		} );

		QUnit.test( 'setFromMatrixPosition / lerp / addVectors match the class', ( assert ) => {

			const m = new Matrix4().setPosition( 2, 3, 4 );
			assert.ok( vector4LikeEquals(
				vec4SetFromMatrixPosition( m ),
				new Vector4().setFromMatrixPosition( m )
			), 'setFromMatrixPosition matches the class' );

			const a = vec4Set( 0, 0, 0, 0 );
			const b = vec4Set( 2, 4, 6, 8 );
			assert.ok( vector4LikeEquals(
				vec4Lerp( a, b, 0.5 ),
				new Vector4().copy( a ).lerp( new Vector4().copy( b ), 0.5 )
			), 'lerp matches the class' );

			assert.ok( vector4LikeEquals(
				vec4AddVectors( a, b ),
				new Vector4().addVectors( new Vector4().copy( a ), new Vector4().copy( b ) )
			), 'addVectors matches the class' );

		} );

		QUnit.test( 'fromArray / toArray support non-zero offsets', ( assert ) => {

			const array = [ 999, 1, 2, 3, 4 ];
			const v = vec4FromArray( array, 1 );

			assert.ok( vec4Equals( v, new Vector4().fromArray( array, 1 ) ), 'fromArray with an offset matches the class' );

			const out = [ undefined ];
			vec4ToArray( v, out, 1 );

			assert.deepEqual( out, new Vector4().fromArray( array, 1 ).toArray( [ undefined ], 1 ), 'toArray with an offset matches the class' );

		} );

		QUnit.test( 'addScalar / multiplyScalar match the class', ( assert ) => {

			const v = vec4Set( 1, 2, 3, 4 );

			assert.ok( vector4LikeEquals(
				vec4AddScalar( v, 5 ),
				new Vector4( 1, 2, 3, 4 ).addScalar( 5 )
			), 'addScalar matches the class' );

			assert.ok( vector4LikeEquals(
				vec4MultiplyScalar( v, 2 ),
				new Vector4( 1, 2, 3, 4 ).multiplyScalar( 2 )
			), 'multiplyScalar matches the class' );

		} );

	} );

} );
