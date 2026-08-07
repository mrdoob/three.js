import {
	vec3Add,
	vec3ApplyAxisAngle,
	vec3ApplyEuler,
	vec3ApplyMatrix4,
	vec3ApplyQuaternion,
	vec3ClampLength,
	vec3Copy,
	vec3Create,
	vec3Cross,
	vec3CrossVectors,
	vec3DistanceTo,
	vec3Divide,
	vec3Dot,
	vec3Equals,
	vec3FromArray,
	vec3FromBufferAttribute,
	vec3Length,
	vec3Lerp,
	vec3Multiply,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3ProjectOnPlane,
	vec3ProjectOnVector,
	vec3Reflect,
	vec3Set,
	vec3SetFromMatrixColumn,
	vec3SetFromMatrixScale,
	vec3Sub,
	vec3SubVectors,
	vec3ToArray
} from '../../../../src/math/Vector3Functions.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Euler } from '../../../../src/math/Euler.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { eps } from '../../utils/math-constants.js';

function vector3LikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.x - b.x ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance &&
		Math.abs( a.z - b.z ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector3Functions', () => {

		QUnit.test( 'vec3Create is a plain Vector3Like, not a Vector3 instance', ( assert ) => {

			const v = vec3Create();

			assert.strictEqual( v.x, 0, 'default x' );
			assert.strictEqual( v.y, 0, 'default y' );
			assert.strictEqual( v.z, 0, 'default z' );
			assert.notOk( v.isVector3, 'is not branded as a Vector3' );

		} );

		QUnit.test( 'operations work on plain objects without importing Vector3', ( assert ) => {

			const a = { x: 2, y: 3, z: 5 };
			const b = { x: 7, y: 11, z: 13 };

			const sum = vec3Add( a, b );
			assert.ok( ! sum.isVector3, 'result is a plain Vector3Like' );
			assert.ok( vector3LikeEquals( sum, new Vector3().copy( a ).add( new Vector3().copy( b ) ) ), 'matches the class result' );

			const cross = vec3Cross( a, b );
			assert.ok( vector3LikeEquals( cross, new Vector3().copy( a ).cross( new Vector3().copy( b ) ) ), 'cross matches the class result' );

			const dot = vec3Dot( a, b );
			assert.strictEqual( dot, new Vector3().copy( a ).dot( new Vector3().copy( b ) ), 'dot matches the class result' );

		} );

		QUnit.test( 'omitting the target allocates a new Vector3Like, providing one reuses it', ( assert ) => {

			const source = new Vector3( 1, 2, 3 );

			const allocated = vec3Copy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( vector3LikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = vec3Create();
			const returned = vec3Copy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( vector3LikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'add/sub/multiply/divide are safe when the target aliases an input', ( assert ) => {

			const a = new Vector3( 2, 3, 5 );
			const b = new Vector3( 7, 11, 13 );

			const expectedAdd = vec3Add( a, b );
			const aliasA = vec3Copy( a );
			vec3Add( aliasA, b, aliasA );
			assert.ok( vector3LikeEquals( aliasA, expectedAdd ), 'add aliasing the first argument produces the correct result' );

			const expectedSub = vec3Sub( a, b );
			const aliasB = vec3Copy( b );
			vec3Sub( a, aliasB, aliasB );
			assert.ok( vector3LikeEquals( aliasB, expectedSub ), 'sub aliasing the second argument produces the correct result' );

			const expectedMultiply = vec3Multiply( a, b );
			const aliasC = vec3Copy( a );
			vec3Multiply( aliasC, b, aliasC );
			assert.ok( vector3LikeEquals( aliasC, expectedMultiply ), 'multiply aliasing the first argument produces the correct result' );

			const expectedDivide = vec3Divide( a, b );
			const aliasD = vec3Copy( a );
			vec3Divide( aliasD, b, aliasD );
			assert.ok( vector3LikeEquals( aliasD, expectedDivide ), 'divide aliasing the first argument produces the correct result' );

		} );

		QUnit.test( 'crossVectors is safe when the target aliases an input', ( assert ) => {

			const a = new Vector3( 2, 3, 5 );
			const b = new Vector3( 7, 11, 13 );
			const expected = vec3CrossVectors( a, b );

			const aliasA = vec3Copy( a );
			vec3CrossVectors( aliasA, b, aliasA );
			assert.ok( vector3LikeEquals( aliasA, expected ), 'target aliasing the first argument produces the correct result' );

			const aliasB = vec3Copy( b );
			vec3CrossVectors( a, aliasB, aliasB );
			assert.ok( vector3LikeEquals( aliasB, expected ), 'target aliasing the second argument produces the correct result' );

		} );

		QUnit.test( 'normalize handles the zero-length vector like the class does', ( assert ) => {

			const zero = vec3Create();
			const normalized = vec3Normalize( zero );

			assert.ok( vector3LikeEquals( normalized, new Vector3().normalize() ), 'zero-length vector normalizes like the class' );

		} );

		QUnit.test( 'projectOnVector/reflect/projectOnPlane handle the degenerate case and match the class', ( assert ) => {

			const v = new Vector3( 1, 2, 3 );
			const zeroOnto = vec3Create();

			assert.ok( vec3Equals( vec3ProjectOnVector( v, zeroOnto ), { x: 0, y: 0, z: 0 } ), 'projecting onto a zero vector yields zero' );

			const onto = new Vector3( 10, 0, 0 );
			assert.ok( vector3LikeEquals(
				vec3ProjectOnVector( v, onto ),
				new Vector3().copy( v ).projectOnVector( onto )
			), 'projectOnVector matches the class' );

			const normal = new Vector3( 0, 1, 0 );
			assert.ok( vector3LikeEquals(
				vec3Reflect( v, normal ),
				new Vector3().copy( v ).reflect( normal )
			), 'reflect matches the class' );

			assert.ok( vector3LikeEquals(
				vec3ProjectOnPlane( v, normal ),
				new Vector3().copy( v ).projectOnPlane( normal )
			), 'projectOnPlane matches the class' );

		} );

		QUnit.test( 'clampLength matches the class, including the zero-length case', ( assert ) => {

			const v = new Vector3( 3, 0, 0 );
			assert.ok( vector3LikeEquals( vec3ClampLength( v, 0, 1 ), new Vector3().copy( v ).clampLength( 0, 1 ) ), 'clamps to max' );

			const zero = vec3Create();
			assert.ok( vector3LikeEquals( vec3ClampLength( zero, 1, 2 ), new Vector3().clampLength( 1, 2 ) ), 'zero-length vector matches the class' );

		} );

		QUnit.test( 'applyEuler matches the class for every rotation order', ( assert ) => {

			const orders = [ 'XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY' ];
			const v = { x: 1, y: 2, z: 3 };

			for ( const order of orders ) {

				const euler = new Euler( 0.4, - 0.7, 1.1, order );
				const functional = vec3ApplyEuler( v, euler );
				const classResult = new Vector3().copy( v ).applyEuler( euler );

				assert.ok( vector3LikeEquals( functional, classResult ), `applyEuler matches the class for order ${order}` );

			}

		} );

		QUnit.test( 'applyAxisAngle matches the class and does not require a Quaternion', ( assert ) => {

			const v = { x: 1, y: 0, z: 0 };
			const axis = { x: 0, y: 1, z: 0 };
			const angle = Math.PI / 3;

			const functional = vec3ApplyAxisAngle( v, axis, angle );
			const classResult = new Vector3().copy( v ).applyAxisAngle( new Vector3().copy( axis ), angle );

			assert.ok( vector3LikeEquals( functional, classResult ), 'applyAxisAngle matches the class' );

		} );

		QUnit.test( 'applyQuaternion accepts a plain {x,y,z,w} object', ( assert ) => {

			const v = { x: 1, y: 0, z: 0 };
			const identity = { x: 0, y: 0, z: 0, w: 1 };

			const result = vec3ApplyQuaternion( v, identity );
			assert.ok( vec3Equals( result, v ), 'identity quaternion leaves the vector unchanged' );

		} );

		QUnit.test( 'applyMatrix4 matches the class', ( assert ) => {

			const v = new Vector3( 1, 2, 3 );
			const m = new Matrix4().makeRotationX( Math.PI / 5 ).setPosition( 4, 5, 6 );

			const functional = vec3ApplyMatrix4( v, m );
			const classResult = new Vector3().copy( v ).applyMatrix4( m );

			assert.ok( vector3LikeEquals( functional, classResult ), 'applyMatrix4 matches the class' );

		} );

		QUnit.test( 'setFromMatrixColumn / setFromMatrixScale match the class', ( assert ) => {

			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			const column = vec3SetFromMatrixColumn( m, 1 );
			assert.ok( vector3LikeEquals( column, new Vector3().setFromMatrixColumn( m, 1 ) ), 'setFromMatrixColumn matches the class' );

			const scale = vec3SetFromMatrixScale( m );
			assert.ok( vector3LikeEquals( scale, new Vector3().setFromMatrixScale( m ) ), 'setFromMatrixScale matches the class' );

		} );

		QUnit.test( 'lerp is safe when the target aliases the second argument', ( assert ) => {

			const a = new Vector3( 0, 0, 0 );
			const b = new Vector3( 10, 20, 30 );

			const expected = vec3Lerp( a, b, 0.25 );

			const aliasB = vec3Copy( b );
			vec3Lerp( a, aliasB, 0.25, aliasB );
			assert.ok( vector3LikeEquals( aliasB, expected ), 'target aliasing the second argument produces the correct result' );

		} );

		QUnit.test( 'distanceTo matches the class using an epsilon comparison', ( assert ) => {

			const a = { x: 0, y: 0, z: 0 };
			const b = { x: 1, y: 2, z: 2 };

			assert.ok( Math.abs( vec3DistanceTo( a, b ) - new Vector3().copy( a ).distanceTo( new Vector3().copy( b ) ) ) < eps, 'distanceTo matches the class' );

		} );

		QUnit.test( 'fromArray / toArray support non-zero offsets', ( assert ) => {

			const array = [ 999, 1, 2, 3, 4, 5, 6 ];
			const v = vec3FromArray( array, 1 );

			assert.ok( vec3Equals( v, new Vector3().fromArray( array, 1 ) ), 'fromArray with an offset matches the class' );

			const out = [ undefined ];
			vec3ToArray( v, out, 1 );

			assert.deepEqual( out, new Vector3().fromArray( array, 1 ).toArray( [ undefined ], 1 ), 'toArray with an offset matches the class' );

		} );

		QUnit.test( 'fromBufferAttribute matches the class', ( assert ) => {

			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );

			const v = vec3FromBufferAttribute( attr, 1 );
			assert.ok( vec3Equals( v, new Vector3().fromBufferAttribute( attr, 1 ) ), 'matches the class' );

		} );

		QUnit.test( 'multiplyScalar / length / set round-trip', ( assert ) => {

			const v = vec3Set( vec3Create(), 3, 4, 0 );
			assert.strictEqual( vec3Length( v ), 5, 'length is computed correctly' );

			const scaled = vec3MultiplyScalar( v, 2 );
			assert.ok( vector3LikeEquals( scaled, { x: 6, y: 8, z: 0 } ), 'multiplyScalar scales all components' );

		} );

		QUnit.test( 'operations work on Vector3 instances passed as plain arguments', ( assert ) => {

			const a = new Vector3( 1, 2, 3 );
			const b = new Vector3( 4, 5, 6 );

			const result = vec3SubVectors( b, a );
			assert.ok( ! result.isVector3, 'result is a plain Vector3Like even though the inputs were Vector3 instances' );
			assert.ok( vector3LikeEquals( result, { x: 3, y: 3, z: 3 } ), 'subVectors is numerically correct' );

		} );

	} );

} );
