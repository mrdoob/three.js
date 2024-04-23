/* global QUnit */

import { Vector3 } from '../../../../src/math/Vector3.js';
import { Vector4 } from '../../../../src/math/Vector4.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { Spherical } from '../../../../src/math/Spherical.js';
import { Quaternion } from '../../../../src/math/Quaternion.js';
import { Euler } from '../../../../src/math/Euler.js';
import { Cylindrical } from '../../../../src/math/Cylindrical.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import {
	x,
	y,
	z,
	eps
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Vector3();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );

			a = new Vector3( x, y, z );
			assert.ok( a.x === x, 'Passed!' );
			assert.ok( a.y === y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVector3', ( assert ) => {

			const object = new Vector3();
			assert.ok( object.isVector3, 'Vector3.isVector3 should be true' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const a = new Vector3();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );

			a.set( x, y, z );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );

		} );

		QUnit.todo( 'setScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setX', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setY', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setZ', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setComponent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getComponent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3().copy( a );
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z == z, 'Passed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = - 2;
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z == z, 'Passed!' );

		} );

		QUnit.test( 'add', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.add( b );
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );

			const c = new Vector3().addVectors( b, b );
			assert.ok( c.x == - 2 * x, 'Passed!' );
			assert.ok( c.y == - 2 * y, 'Passed!' );
			assert.ok( c.z == - 2 * z, 'Passed!' );

		} );

		QUnit.todo( 'addScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addVectors', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'addScaledVector', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2, 3, 4 );
			const s = 3;

			a.addScaledVector( b, s );
			assert.strictEqual( a.x, x + b.x * s, 'Check x' );
			assert.strictEqual( a.y, y + b.y * s, 'Check y' );
			assert.strictEqual( a.z, z + b.z * s, 'Check z' );

		} );

		QUnit.test( 'sub', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.sub( b );
			assert.ok( a.x == 2 * x, 'Passed!' );
			assert.ok( a.y == 2 * y, 'Passed!' );
			assert.ok( a.z == 2 * z, 'Passed!' );

			const c = new Vector3().subVectors( a, a );
			assert.ok( c.x == 0, 'Passed!' );
			assert.ok( c.y == 0, 'Passed!' );
			assert.ok( c.z == 0, 'Passed!' );

		} );

		QUnit.todo( 'subScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'subVectors', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiply', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiplyScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'multiplyVectors', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2, 3, - 5 );

			const c = new Vector3().multiplyVectors( a, b );
			assert.strictEqual( c.x, x * 2, 'Check x' );
			assert.strictEqual( c.y, y * 3, 'Check y' );
			assert.strictEqual( c.z, z * - 5, 'Check z' );

		} );

		QUnit.test( 'applyEuler', ( assert ) => {

			const a = new Vector3( x, y, z );
			const euler = new Euler( 90, - 45, 0 );
			const expected = new Vector3( - 2.352970120501014, - 4.7441750936226645, 0.9779234597246458 );

			a.applyEuler( euler );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'applyAxisAngle', ( assert ) => {

			const a = new Vector3( x, y, z );
			const axis = new Vector3( 0, 1, 0 );
			const angle = Math.PI / 4.0;
			const expected = new Vector3( 3 * Math.sqrt( 2 ), 3, Math.sqrt( 2 ) );

			a.applyAxisAngle( axis, angle );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'applyMatrix3', ( assert ) => {

			const a = new Vector3( x, y, z );
			const m = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );

			a.applyMatrix3( m );
			assert.strictEqual( a.x, 33, 'Check x' );
			assert.strictEqual( a.y, 99, 'Check y' );
			assert.strictEqual( a.z, 183, 'Check z' );

		} );

		QUnit.todo( 'applyNormalMatrix', ( assert ) => {

			// applyNormalMatrix( m )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix4', ( assert ) => {


			const a = new Vector3( x, y, z );
			const b = new Vector4( x, y, z, 1 );

			let m = new Matrix4().makeRotationX( Math.PI );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, 'Passed!' );
			assert.ok( a.y == b.y / b.w, 'Passed!' );
			assert.ok( a.z == b.z / b.w, 'Passed!' );

			m = new Matrix4().makeTranslation( 3, 2, 1 );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, 'Passed!' );
			assert.ok( a.y == b.y / b.w, 'Passed!' );
			assert.ok( a.z == b.z / b.w, 'Passed!' );

			m = new Matrix4().set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 1, 0
			);
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			assert.ok( a.x == b.x / b.w, 'Passed!' );
			assert.ok( a.y == b.y / b.w, 'Passed!' );
			assert.ok( a.z == b.z / b.w, 'Passed!' );

		} );

		QUnit.test( 'applyQuaternion', ( assert ) => {

			const a = new Vector3( x, y, z );

			a.applyQuaternion( new Quaternion() );
			assert.strictEqual( a.x, x, 'Identity rotation: check x' );
			assert.strictEqual( a.y, y, 'Identity rotation: check y' );
			assert.strictEqual( a.z, z, 'Identity rotation: check z' );

		} );

		QUnit.todo( 'project', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'unproject', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'transformDirection', ( assert ) => {

			const a = new Vector3( x, y, z );
			const m = new Matrix4();
			const transformed = new Vector3( 0.3713906763541037, 0.5570860145311556, 0.7427813527082074 );

			a.transformDirection( m );
			assert.ok( Math.abs( a.x - transformed.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - transformed.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - transformed.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'divide', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'divideScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'min', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'max', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clamp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'clampScalar', ( assert ) => {

			const a = new Vector3( - 0.01, 0.5, 1.5 );
			const clamped = new Vector3( 0.1, 0.5, 1.0 );

			a.clampScalar( 0.1, 1.0 );
			assert.ok( Math.abs( a.x - clamped.x ) <= 0.001, 'Check x' );
			assert.ok( Math.abs( a.y - clamped.y ) <= 0.001, 'Check y' );
			assert.ok( Math.abs( a.z - clamped.z ) <= 0.001, 'Check z' );

		} );

		QUnit.todo( 'clampLength', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'floor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'ceil', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'round', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'roundToZero', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'negate', ( assert ) => {

			const a = new Vector3( x, y, z );

			a.negate();
			assert.ok( a.x == - x, 'Passed!' );
			assert.ok( a.y == - y, 'Passed!' );
			assert.ok( a.z == - z, 'Passed!' );

		} );

		QUnit.test( 'dot', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );
			const c = new Vector3();

			let result = a.dot( b );
			assert.ok( result == ( - x * x - y * y - z * z ), 'Passed!' );

			result = a.dot( c );
			assert.ok( result == 0, 'Passed!' );

		} );

		QUnit.todo( 'lengthSq', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'length', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'manhattanLength', ( assert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			assert.ok( a.manhattanLength() == x, 'Positive x' );
			assert.ok( b.manhattanLength() == y, 'Negative y' );
			assert.ok( c.manhattanLength() == z, 'Positive z' );
			assert.ok( d.manhattanLength() == 0, 'Empty initialization' );

			a.set( x, y, z );
			assert.ok( a.manhattanLength() == Math.abs( x ) + Math.abs( y ) + Math.abs( z ), 'All components' );

		} );

		QUnit.test( 'normalize', ( assert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );

			a.normalize();
			assert.ok( a.length() == 1, 'Passed!' );
			assert.ok( a.x == 1, 'Passed!' );

			b.normalize();
			assert.ok( b.length() == 1, 'Passed!' );
			assert.ok( b.y == - 1, 'Passed!' );

			c.normalize();
			assert.ok( c.length() == 1, 'Passed!' );
			assert.ok( c.z == 1, 'Passed!' );

		} );

		QUnit.test( 'setLength', ( assert ) => {

			let a = new Vector3( x, 0, 0 );

			assert.ok( a.length() == x, 'Passed!' );
			a.setLength( y );
			assert.ok( a.length() == y, 'Passed!' );

			a = new Vector3( 0, 0, 0 );
			assert.ok( a.length() == 0, 'Passed!' );
			a.setLength( y );
			assert.ok( a.length() == 0, 'Passed!' );
			a.setLength();
			assert.ok( isNaN( a.length() ), 'Passed!' );

		} );

		QUnit.todo( 'lerp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerpVectors', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'cross', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2 * x, - y, 0.5 * z );
			const crossed = new Vector3( 18, 12, - 18 );

			a.cross( b );
			assert.ok( Math.abs( a.x - crossed.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - crossed.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - crossed.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'crossVectors', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( x, - y, z );
			const c = new Vector3();
			const crossed = new Vector3( 24, 0, - 12 );

			c.crossVectors( a, b );
			assert.ok( Math.abs( c.x - crossed.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( c.y - crossed.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( c.z - crossed.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'projectOnVector', ( assert ) => {

			const a = new Vector3( 1, 0, 0 );
			const b = new Vector3();
			const normal = new Vector3( 10, 0, 0 );

			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 1, 0, 0 ) ), 'Passed!' );

			a.set( 0, 1, 0 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Passed!' );

			a.set( 0, 0, - 1 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Passed!' );

			a.set( - 1, 0, 0 );
			assert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( - 1, 0, 0 ) ), 'Passed!' );

		} );

		QUnit.test( 'projectOnPlane', ( assert ) => {

			const a = new Vector3( 1, 0, 0 );
			const b = new Vector3();
			const normal = new Vector3( 1, 0, 0 );

			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Passed!' );

			a.set( 0, 1, 0 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 1, 0 ) ), 'Passed!' );

			a.set( 0, 0, - 1 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, - 1 ) ), 'Passed!' );

			a.set( - 1, 0, 0 );
			assert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Passed!' );

		} );

		QUnit.test( 'reflect', ( assert ) => {

			const a = new Vector3();
			const normal = new Vector3( 0, 1, 0 );
			const b = new Vector3();

			a.set( 0, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 0, 1, 0 ) ), 'Passed!' );

			a.set( 1, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), 'Passed!' );

			a.set( 1, - 1, 0 );
			normal.set( 0, - 1, 0 );
			assert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), 'Passed!' );

		} );

		QUnit.test( 'angleTo', ( assert ) => {

			const a = new Vector3( 0, - 0.18851655680720186, 0.9820700116639124 );
			const b = new Vector3( 0, 0.18851655680720186, - 0.9820700116639124 );

			assert.equal( a.angleTo( a ), 0 );
			assert.equal( a.angleTo( b ), Math.PI );

			const x = new Vector3( 1, 0, 0 );
			const y = new Vector3( 0, 1, 0 );
			const z = new Vector3( 0, 0, 1 );

			assert.equal( x.angleTo( y ), Math.PI / 2 );
			assert.equal( x.angleTo( z ), Math.PI / 2 );
			assert.equal( z.angleTo( x ), Math.PI / 2 );

			assert.ok( Math.abs( x.angleTo( new Vector3( 1, 1, 0 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );

		} );

		QUnit.todo( 'distanceTo', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'distanceToSquared', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'manhattanDistanceTo', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromSpherical', ( assert ) => {

			const a = new Vector3();
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const sph = new Spherical( 10, phi, theta );
			const expected = new Vector3( - 4.677914006701843, - 5, - 7.288149322420796 );

			a.setFromSpherical( sph );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'setFromSphericalCoords', ( assert ) => {

			// setFromSphericalCoords( radius, phi, theta )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromCylindrical', ( assert ) => {

			const a = new Vector3();
			const cyl = new Cylindrical( 10, Math.PI * 0.125, 20 );
			const expected = new Vector3( 3.826834323650898, 20, 9.238795325112868 );

			a.setFromCylindrical( cyl );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'setFromCylindricalCoords', ( assert ) => {

			// setFromCylindricalCoords( radius, theta, y )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromMatrixPosition', ( assert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixPosition( m );
			assert.strictEqual( a.x, 7, 'Check x' );
			assert.strictEqual( a.y, 19, 'Check y' );
			assert.strictEqual( a.z, 37, 'Check z' );

		} );

		QUnit.test( 'setFromMatrixScale', ( assert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const expected = new Vector3( 25.573423705088842, 31.921779399024736, 35.70714214271425 );

			a.setFromMatrixScale( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'setFromMatrixColumn', ( assert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixColumn( m, 0 );
			assert.strictEqual( a.x, 2, 'Index 0: check x' );
			assert.strictEqual( a.y, 11, 'Index 0: check y' );
			assert.strictEqual( a.z, 23, 'Index 0: check z' );

			a.setFromMatrixColumn( m, 2 );
			assert.strictEqual( a.x, 5, 'Index 2: check x' );
			assert.strictEqual( a.y, 17, 'Index 2: check y' );
			assert.strictEqual( a.z, 31, 'Index 2: check z' );

		} );

		QUnit.todo( 'setFromMatrix3Column', ( assert ) => {

			// setFromMatrix3Column( mat3, index )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFromEuler', ( assert ) => {

			// setFromEuler( e )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( assert ) => {

			const a = new Vector3( x, 0, z );
			const b = new Vector3( 0, - y, 0 );

			assert.ok( a.x != b.x, 'Passed!' );
			assert.ok( a.y != b.y, 'Passed!' );
			assert.ok( a.z != b.z, 'Passed!' );

			assert.ok( ! a.equals( b ), 'Passed!' );
			assert.ok( ! b.equals( a ), 'Passed!' );

			a.copy( b );
			assert.ok( a.x == b.x, 'Passed!' );
			assert.ok( a.y == b.y, 'Passed!' );
			assert.ok( a.z == b.z, 'Passed!' );

			assert.ok( a.equals( b ), 'Passed!' );
			assert.ok( b.equals( a ), 'Passed!' );

		} );

		QUnit.test( 'fromArray', ( assert ) => {

			const a = new Vector3();
			const array = [ 1, 2, 3, 4, 5, 6 ];

			a.fromArray( array );
			assert.strictEqual( a.x, 1, 'No offset: check x' );
			assert.strictEqual( a.y, 2, 'No offset: check y' );
			assert.strictEqual( a.z, 3, 'No offset: check z' );

			a.fromArray( array, 3 );
			assert.strictEqual( a.x, 4, 'With offset: check x' );
			assert.strictEqual( a.y, 5, 'With offset: check y' );
			assert.strictEqual( a.z, 6, 'With offset: check z' );

		} );

		QUnit.test( 'toArray', ( assert ) => {

			const a = new Vector3( x, y, z );

			let array = a.toArray();
			assert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );

			array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );

			array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			assert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			assert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			assert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );

		} );

		QUnit.test( 'fromBufferAttribute', ( assert ) => {

			const a = new Vector3();
			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );

			a.fromBufferAttribute( attr, 0 );
			assert.strictEqual( a.x, 1, 'Offset 0: check x' );
			assert.strictEqual( a.y, 2, 'Offset 0: check y' );
			assert.strictEqual( a.z, 3, 'Offset 0: check z' );

			a.fromBufferAttribute( attr, 1 );
			assert.strictEqual( a.x, 4, 'Offset 1: check x' );
			assert.strictEqual( a.y, 5, 'Offset 1: check y' );
			assert.strictEqual( a.z, 6, 'Offset 1: check z' );

		} );

		QUnit.todo( 'random', ( assert ) => {

			// random()
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'randomDirection', ( assert ) => {

			const vec = new Vector3();

			vec.randomDirection();

			const zero = new Vector3();
			assert.notDeepEqual(
				vec,
				zero,
				'randomizes at least one component of the vector'
			);

			assert.ok( ( 1 - vec.length() ) <= Number.EPSILON, 'produces a unit vector' );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( 'setX,setY,setZ', ( assert ) => {

			const a = new Vector3();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );

			a.setX( x );
			a.setY( y );
			a.setZ( z );

			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );

		} );

		QUnit.test( 'setComponent,getComponent', ( assert ) => {

			const a = new Vector3();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			a.setComponent( 2, 3 );
			assert.ok( a.getComponent( 0 ) == 1, 'Passed!' );
			assert.ok( a.getComponent( 1 ) == 2, 'Passed!' );
			assert.ok( a.getComponent( 2 ) == 3, 'Passed!' );

		} );

		QUnit.test( 'setComponent/getComponent exceptions', ( assert ) => {

			const a = new Vector3();

			assert.throws(
				function () {

					a.setComponent( 3, 0 );

				},
				/index is out of range/,
				'setComponent with an out of range index throws Error'
			);
			assert.throws(
				function () {

					a.getComponent( 3 );

				},
				/index is out of range/,
				'getComponent with an out of range index throws Error'
			);

		} );

		QUnit.test( 'min/max/clamp', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );
			const c = new Vector3();

			c.copy( a ).min( b );
			assert.ok( c.x == - x, 'Passed!' );
			assert.ok( c.y == - y, 'Passed!' );
			assert.ok( c.z == - z, 'Passed!' );

			c.copy( a ).max( b );
			assert.ok( c.x == x, 'Passed!' );
			assert.ok( c.y == y, 'Passed!' );
			assert.ok( c.z == z, 'Passed!' );

			c.set( - 2 * x, 2 * y, - 2 * z );
			c.clamp( b, a );
			assert.ok( c.x == - x, 'Passed!' );
			assert.ok( c.y == y, 'Passed!' );
			assert.ok( c.z == - z, 'Passed!' );

		} );

		QUnit.test( 'distanceTo/distanceToSquared', ( assert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			assert.ok( a.distanceTo( d ) == x, 'Passed!' );
			assert.ok( a.distanceToSquared( d ) == x * x, 'Passed!' );

			assert.ok( b.distanceTo( d ) == y, 'Passed!' );
			assert.ok( b.distanceToSquared( d ) == y * y, 'Passed!' );

			assert.ok( c.distanceTo( d ) == z, 'Passed!' );
			assert.ok( c.distanceToSquared( d ) == z * z, 'Passed!' );

		} );

		QUnit.test( 'setScalar/addScalar/subScalar', ( assert ) => {

			const a = new Vector3();
			const s = 3;

			a.setScalar( s );
			assert.strictEqual( a.x, s, 'setScalar: check x' );
			assert.strictEqual( a.y, s, 'setScalar: check y' );
			assert.strictEqual( a.z, s, 'setScalar: check z' );

			a.addScalar( s );
			assert.strictEqual( a.x, 2 * s, 'addScalar: check x' );
			assert.strictEqual( a.y, 2 * s, 'addScalar: check y' );
			assert.strictEqual( a.z, 2 * s, 'addScalar: check z' );

			a.subScalar( 2 * s );
			assert.strictEqual( a.x, 0, 'subScalar: check x' );
			assert.strictEqual( a.y, 0, 'subScalar: check y' );
			assert.strictEqual( a.z, 0, 'subScalar: check z' );

		} );

		QUnit.test( 'multiply/divide', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2 * x, 2 * y, 2 * z );
			const c = new Vector3( 4 * x, 4 * y, 4 * z );

			a.multiply( b );
			assert.strictEqual( a.x, x * b.x, 'multiply: check x' );
			assert.strictEqual( a.y, y * b.y, 'multiply: check y' );
			assert.strictEqual( a.z, z * b.z, 'multiply: check z' );

			b.divide( c );
			assert.ok( Math.abs( b.x - 0.5 ) <= eps, 'divide: check z' );
			assert.ok( Math.abs( b.y - 0.5 ) <= eps, 'divide: check z' );
			assert.ok( Math.abs( b.z - 0.5 ) <= eps, 'divide: check z' );

		} );

		QUnit.test( 'multiply/divide', ( assert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.multiplyScalar( - 2 );
			assert.ok( a.x == x * - 2, 'Passed!' );
			assert.ok( a.y == y * - 2, 'Passed!' );
			assert.ok( a.z == z * - 2, 'Passed!' );

			b.multiplyScalar( - 2 );
			assert.ok( b.x == 2 * x, 'Passed!' );
			assert.ok( b.y == 2 * y, 'Passed!' );
			assert.ok( b.z == 2 * z, 'Passed!' );

			a.divideScalar( - 2 );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );

			b.divideScalar( - 2 );
			assert.ok( b.x == - x, 'Passed!' );
			assert.ok( b.y == - y, 'Passed!' );
			assert.ok( b.z == - z, 'Passed!' );

		} );

		QUnit.test( 'project/unproject', ( assert ) => {

			const a = new Vector3( x, y, z );
			const camera = new PerspectiveCamera( 75, 16 / 9, 0.1, 300.0 );
			const projected = new Vector3( - 0.36653213611158914, - 0.9774190296309043, 1.0506835611870624 );

			a.project( camera );
			assert.ok( Math.abs( a.x - projected.x ) <= eps, 'project: check x' );
			assert.ok( Math.abs( a.y - projected.y ) <= eps, 'project: check y' );
			assert.ok( Math.abs( a.z - projected.z ) <= eps, 'project: check z' );

			a.unproject( camera );
			assert.ok( Math.abs( a.x - x ) <= eps, 'unproject: check x' );
			assert.ok( Math.abs( a.y - y ) <= eps, 'unproject: check y' );
			assert.ok( Math.abs( a.z - z ) <= eps, 'unproject: check z' );

		} );

		QUnit.test( 'length/lengthSq', ( assert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			assert.ok( a.length() == x, 'Passed!' );
			assert.ok( a.lengthSq() == x * x, 'Passed!' );
			assert.ok( b.length() == y, 'Passed!' );
			assert.ok( b.lengthSq() == y * y, 'Passed!' );
			assert.ok( c.length() == z, 'Passed!' );
			assert.ok( c.lengthSq() == z * z, 'Passed!' );
			assert.ok( d.length() == 0, 'Passed!' );
			assert.ok( d.lengthSq() == 0, 'Passed!' );

			a.set( x, y, z );
			assert.ok( a.length() == Math.sqrt( x * x + y * y + z * z ), 'Passed!' );
			assert.ok( a.lengthSq() == ( x * x + y * y + z * z ), 'Passed!' );

		} );

		QUnit.test( 'lerp/clone', ( assert ) => {

			const a = new Vector3( x, 0, z );
			const b = new Vector3( 0, - y, 0 );

			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), 'Passed!' );
			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), 'Passed!' );

			assert.ok( a.clone().lerp( b, 0 ).equals( a ), 'Passed!' );

			assert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, 'Passed!' );
			assert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, 'Passed!' );
			assert.ok( a.clone().lerp( b, 0.5 ).z == z * 0.5, 'Passed!' );

			assert.ok( a.clone().lerp( b, 1 ).equals( b ), 'Passed!' );

		} );

		// OTHERS
		QUnit.test( 'iterable', ( assert ) => {

			const v = new Vector3( 0, 0.5, 1 );
			const array = [ ...v ];
			assert.strictEqual( array[ 0 ], 0, 'Vector3 is iterable.' );
			assert.strictEqual( array[ 1 ], 0.5, 'Vector3 is iterable.' );
			assert.strictEqual( array[ 2 ], 1, 'Vector3 is iterable.' );

		} );

	} );

} );
