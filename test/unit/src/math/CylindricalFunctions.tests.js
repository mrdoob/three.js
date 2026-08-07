import {
	cylindricalCopy,
	cylindricalCreate,
	cylindricalSet,
	cylindricalSetFromCartesianCoords,
	cylindricalSetFromVector3
} from '../../../../src/math/CylindricalFunctions.js';
import { Cylindrical } from '../../../../src/math/Cylindrical.js';
import { eps } from '../../utils/math-constants.js';

function cylindricalLikeEquals( a, b, tolerance = eps ) {

	return Math.abs( a.radius - b.radius ) <= tolerance &&
		Math.abs( a.theta - b.theta ) <= tolerance &&
		Math.abs( a.y - b.y ) <= tolerance;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'CylindricalFunctions', () => {

		QUnit.test( 'cylindricalCreate is a plain CylindricalLike, not a Cylindrical instance', ( assert ) => {

			const c = cylindricalCreate();

			assert.strictEqual( c.radius, 1, 'default radius' );
			assert.strictEqual( c.theta, 0, 'default theta' );
			assert.strictEqual( c.y, 0, 'default y' );
			assert.notOk( c.isCylindrical, 'is not branded as a Cylindrical' );
			assert.ok( cylindricalLikeEquals( c, new Cylindrical() ), 'matches new Cylindrical()' );

		} );

		QUnit.test( 'operations work on plain objects without importing Cylindrical', ( assert ) => {

			const a = cylindricalSet( 10, Math.PI, 5 );
			const b = cylindricalCopy( a );
			const fromCartesian = cylindricalSetFromCartesianCoords( 3, - 1, - 3 );
			const fromVector = cylindricalSetFromVector3( { x: 3, y: - 1, z: - 3 } );

			assert.ok( ! a.isCylindrical, 'set result is a plain CylindricalLike' );
			assert.ok( ! b.isCylindrical, 'copy result is a plain CylindricalLike' );
			assert.ok( cylindricalLikeEquals( a, b ), 'copy matches source' );
			assert.ok( cylindricalLikeEquals( fromCartesian, fromVector ), 'setFromCartesianCoords matches setFromVector3' );
			assert.ok( Math.abs( fromCartesian.radius - Math.sqrt( 18 ) ) <= eps, 'radius from Cartesian' );
			assert.ok( Math.abs( fromCartesian.theta - Math.atan2( 3, - 3 ) ) <= eps, 'theta from Cartesian' );
			assert.strictEqual( fromCartesian.y, - 1, 'y from Cartesian' );

		} );

		QUnit.test( 'omitting the target allocates a new CylindricalLike, providing one reuses it', ( assert ) => {

			const source = { radius: 10, theta: Math.PI, y: 5 };

			const allocated = cylindricalCopy( source );
			assert.notStrictEqual( allocated, source, 'a new object is allocated' );
			assert.ok( cylindricalLikeEquals( allocated, source ), 'the allocated copy matches the source' );

			const reused = cylindricalCreate();
			const returned = cylindricalCopy( source, reused );
			assert.strictEqual( returned, reused, 'the provided target is returned' );
			assert.ok( cylindricalLikeEquals( reused, source ), 'the provided target holds the result' );

			const setTarget = { radius: 0, theta: 0, y: 0 };
			assert.strictEqual( cylindricalSet( 2, 3, 4, setTarget ), setTarget, 'set reuses target' );
			assert.ok( cylindricalLikeEquals( setTarget, { radius: 2, theta: 3, y: 4 } ), 'set writes into target' );

		} );

		QUnit.test( 'setFromVector3 is safe when the target aliases the input vector', ( assert ) => {

			const expected = cylindricalSetFromCartesianCoords( 3, - 1, - 3 );
			const hybrid = { x: 3, y: - 1, z: - 3, radius: 0, theta: 0 };

			cylindricalSetFromVector3( hybrid, hybrid );
			assert.ok( cylindricalLikeEquals( hybrid, expected ), 'reading x/y/z then writing radius/theta/y on the same object is safe' );

			const source = { radius: 10, theta: Math.PI, y: 5 };
			cylindricalCopy( source, source );
			assert.ok( cylindricalLikeEquals( source, { radius: 10, theta: Math.PI, y: 5 } ), 'copy with aliased target is a no-op' );

		} );

		QUnit.test( 'zero-length Cartesian input matches class behavior', ( assert ) => {

			const result = cylindricalSetFromCartesianCoords( 0, 0, 0 );

			assert.strictEqual( result.radius, 0, 'radius is 0' );
			assert.strictEqual( result.theta, 0, 'theta is 0' );
			assert.strictEqual( result.y, 0, 'y is 0' );

		} );

		QUnit.test( 'class wrapper delegates to the same math', ( assert ) => {

			const plain = cylindricalSetFromVector3( { x: 3, y: - 1, z: - 3 } );
			const wrapped = new Cylindrical().setFromVector3( { x: 3, y: - 1, z: - 3 } );

			assert.ok( cylindricalLikeEquals( plain, wrapped ), 'class setFromVector3 matches functional result' );

		} );

	} );

} );
