import {
	sphericalCopy,
	sphericalCreate,
	sphericalMakeSafe,
	sphericalSet,
	sphericalSetFromCartesianCoords,
	sphericalSetFromVector3
} from '../../../../src/math/SphericalFunctions.js';
import { Spherical } from '../../../../src/math/Spherical.js';
import { eps } from '../../utils/math-constants.js';

function sphericalLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.radius - b.radius ) <= tolerance &&
		Math.abs( a.phi - b.phi ) <= tolerance &&
		Math.abs( a.theta - b.theta ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'SphericalFunctions', () => {

		QUnit.test( 'sphericalCreate is a plain SphericalLike, not a Spherical instance', ( assert ) => {

			const s = sphericalCreate();

			assert.strictEqual( s.radius, 1, 'default radius' );
			assert.strictEqual( s.phi, 0, 'default phi' );
			assert.strictEqual( s.theta, 0, 'default theta' );
			assert.notOk( s.isSpherical, 'is not branded as a Spherical' );
			assert.ok( sphericalLikeEquals( s, new Spherical() ), 'matches new Spherical()' );

		} );

		QUnit.test( 'operations work on plain objects without importing Spherical', ( assert ) => {

			const a = { radius: 1, phi: 1, theta: 1 };
			const expected = { radius: 4.554032147688322, phi: 1.3494066171539107, theta: 2.356194490192345 };

			const fromCoords = sphericalSetFromCartesianCoords( Math.PI, 1, - Math.PI );
			assert.ok( ! fromCoords.isSpherical, 'result is a plain SphericalLike' );
			assert.ok( sphericalLikeEquals( fromCoords, expected ), 'matches expected spherical coords' );

			const fromVector = sphericalSetFromVector3( { x: Math.PI, y: 1, z: - Math.PI }, a );
			assert.strictEqual( fromVector, a, 'writes into the provided plain target' );
			assert.ok( sphericalLikeEquals( a, expected ), 'plain-object setFromVector3 matches' );

		} );

		QUnit.test( 'omitting the target allocates a new SphericalLike, providing one reuses it', ( assert ) => {

			const source = { radius: 10, phi: 1.5, theta: 2.5 };

			const allocated = sphericalCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( sphericalLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = sphericalCreate();
			const returned = sphericalCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( sphericalLikeEquals( reused, source ), 'the provided target holds the result' );

		} );

		QUnit.test( 'makeSafe is safe when the target aliases the input', ( assert ) => {

			const EPS = 0.000001;
			const source = { radius: 1, phi: 0, theta: 0 };
			const expected = { radius: 1, phi: EPS, theta: 0 };

			const separate = sphericalMakeSafe( source );
			assert.notStrictEqual( separate, source, 'allocates when target is omitted' );
			assert.ok( sphericalLikeEquals( separate, expected ), 'separate target is clamped' );
			assert.strictEqual( source.phi, 0, 'source is left unchanged' );

			const aliased = sphericalMakeSafe( source, source );
			assert.strictEqual( aliased, source, 'aliased target is returned' );
			assert.ok( sphericalLikeEquals( aliased, expected ), 'aliased makeSafe matches' );

		} );

		QUnit.test( 'setFromCartesianCoords handles the zero-radius degenerate case', ( assert ) => {

			const result = sphericalSetFromCartesianCoords( 0, 0, 0 );

			assert.strictEqual( result.radius, 0, 'radius is zero' );
			assert.strictEqual( result.phi, 0, 'phi is zero' );
			assert.strictEqual( result.theta, 0, 'theta is zero' );

		} );

		QUnit.test( 'sphericalSet and makeSafe match the Spherical class', ( assert ) => {

			const plain = sphericalSet( sphericalCreate(), 1, Math.PI, 0 );
			sphericalMakeSafe( plain, plain );

			const klass = new Spherical().set( 1, Math.PI, 0 ).makeSafe();

			assert.ok( sphericalLikeEquals( plain, klass ), 'functional result matches class result' );

		} );

	} );

} );
