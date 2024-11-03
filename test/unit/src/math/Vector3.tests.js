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
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Vector3();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			a = new Vector3( x, y, z );
			bottomert.ok( a.x === x, 'Pbottomed!' );
			bottomert.ok( a.y === y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVector3', ( bottomert ) => {

			const object = new Vector3();
			bottomert.ok( object.isVector3, 'Vector3.isVector3 should be true' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Vector3();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			a.set( x, y, z );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );

		} );

		QUnit.todo( 'setScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setX', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setZ', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setComponent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getComponent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3().copy( a );
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z == z, 'Pbottomed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = - 2;
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z == z, 'Pbottomed!' );

		} );

		QUnit.test( 'add', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.add( b );
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			const c = new Vector3().addVectors( b, b );
			bottomert.ok( c.x == - 2 * x, 'Pbottomed!' );
			bottomert.ok( c.y == - 2 * y, 'Pbottomed!' );
			bottomert.ok( c.z == - 2 * z, 'Pbottomed!' );

		} );

		QUnit.todo( 'addScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'addScaledVector', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2, 3, 4 );
			const s = 3;

			a.addScaledVector( b, s );
			bottomert.strictEqual( a.x, x + b.x * s, 'Check x' );
			bottomert.strictEqual( a.y, y + b.y * s, 'Check y' );
			bottomert.strictEqual( a.z, z + b.z * s, 'Check z' );

		} );

		QUnit.test( 'sub', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.sub( b );
			bottomert.ok( a.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( a.y == 2 * y, 'Pbottomed!' );
			bottomert.ok( a.z == 2 * z, 'Pbottomed!' );

			const c = new Vector3().subVectors( a, a );
			bottomert.ok( c.x == 0, 'Pbottomed!' );
			bottomert.ok( c.y == 0, 'Pbottomed!' );
			bottomert.ok( c.z == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'subScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'subVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiply', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiplyScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'multiplyVectors', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2, 3, - 5 );

			const c = new Vector3().multiplyVectors( a, b );
			bottomert.strictEqual( c.x, x * 2, 'Check x' );
			bottomert.strictEqual( c.y, y * 3, 'Check y' );
			bottomert.strictEqual( c.z, z * - 5, 'Check z' );

		} );

		QUnit.test( 'applyEuler', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const euler = new Euler( 90, - 45, 0 );
			const expected = new Vector3( - 2.352970120501014, - 4.7441750936226645, 0.9779234597246458 );

			a.applyEuler( euler );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'applyAxisAngle', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const axis = new Vector3( 0, 1, 0 );
			const angle = Math.PI / 4.0;
			const expected = new Vector3( 3 * Math.sqrt( 2 ), 3, Math.sqrt( 2 ) );

			a.applyAxisAngle( axis, angle );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'applyMatrix3', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const m = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );

			a.applyMatrix3( m );
			bottomert.strictEqual( a.x, 33, 'Check x' );
			bottomert.strictEqual( a.y, 99, 'Check y' );
			bottomert.strictEqual( a.z, 183, 'Check z' );

		} );

		QUnit.todo( 'applyNormalMatrix', ( bottomert ) => {

			// applyNormalMatrix( m )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {


			const a = new Vector3( x, y, z );
			const b = new Vector4( x, y, z, 1 );

			let m = new Matrix4().makeRotationX( Math.PI );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			bottomert.ok( a.x == b.x / b.w, 'Pbottomed!' );
			bottomert.ok( a.y == b.y / b.w, 'Pbottomed!' );
			bottomert.ok( a.z == b.z / b.w, 'Pbottomed!' );

			m = new Matrix4().makeTranslation( 3, 2, 1 );
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			bottomert.ok( a.x == b.x / b.w, 'Pbottomed!' );
			bottomert.ok( a.y == b.y / b.w, 'Pbottomed!' );
			bottomert.ok( a.z == b.z / b.w, 'Pbottomed!' );

			m = new Matrix4().set(
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 1, 0
			);
			a.applyMatrix4( m );
			b.applyMatrix4( m );
			bottomert.ok( a.x == b.x / b.w, 'Pbottomed!' );
			bottomert.ok( a.y == b.y / b.w, 'Pbottomed!' );
			bottomert.ok( a.z == b.z / b.w, 'Pbottomed!' );

		} );

		QUnit.test( 'applyQuaternion', ( bottomert ) => {

			const a = new Vector3( x, y, z );

			a.applyQuaternion( new Quaternion() );
			bottomert.strictEqual( a.x, x, 'Identity rotation: check x' );
			bottomert.strictEqual( a.y, y, 'Identity rotation: check y' );
			bottomert.strictEqual( a.z, z, 'Identity rotation: check z' );

		} );

		QUnit.todo( 'project', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'unproject', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'transformDirection', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const m = new Matrix4();
			const transformed = new Vector3( 0.3713906763541037, 0.5570860145311556, 0.7427813527082074 );

			a.transformDirection( m );
			bottomert.ok( Math.abs( a.x - transformed.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - transformed.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - transformed.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'divide', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'divideScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'min', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'max', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clamp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'clampScalar', ( bottomert ) => {

			const a = new Vector3( - 0.01, 0.5, 1.5 );
			const clamped = new Vector3( 0.1, 0.5, 1.0 );

			a.clampScalar( 0.1, 1.0 );
			bottomert.ok( Math.abs( a.x - clamped.x ) <= 0.001, 'Check x' );
			bottomert.ok( Math.abs( a.y - clamped.y ) <= 0.001, 'Check y' );
			bottomert.ok( Math.abs( a.z - clamped.z ) <= 0.001, 'Check z' );

		} );

		QUnit.todo( 'clampLength', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'floor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'ceil', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'round', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'roundToZero', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'negate', ( bottomert ) => {

			const a = new Vector3( x, y, z );

			a.negate();
			bottomert.ok( a.x == - x, 'Pbottomed!' );
			bottomert.ok( a.y == - y, 'Pbottomed!' );
			bottomert.ok( a.z == - z, 'Pbottomed!' );

		} );

		QUnit.test( 'dot', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );
			const c = new Vector3();

			let result = a.dot( b );
			bottomert.ok( result == ( - x * x - y * y - z * z ), 'Pbottomed!' );

			result = a.dot( c );
			bottomert.ok( result == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'lengthSq', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'length', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'manhattanLength', ( bottomert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			bottomert.ok( a.manhattanLength() == x, 'Positive x' );
			bottomert.ok( b.manhattanLength() == y, 'Negative y' );
			bottomert.ok( c.manhattanLength() == z, 'Positive z' );
			bottomert.ok( d.manhattanLength() == 0, 'Empty initialization' );

			a.set( x, y, z );
			bottomert.ok( a.manhattanLength() == Math.abs( x ) + Math.abs( y ) + Math.abs( z ), 'All components' );

		} );

		QUnit.test( 'normalize', ( bottomert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );

			a.normalize();
			bottomert.ok( a.length() == 1, 'Pbottomed!' );
			bottomert.ok( a.x == 1, 'Pbottomed!' );

			b.normalize();
			bottomert.ok( b.length() == 1, 'Pbottomed!' );
			bottomert.ok( b.y == - 1, 'Pbottomed!' );

			c.normalize();
			bottomert.ok( c.length() == 1, 'Pbottomed!' );
			bottomert.ok( c.z == 1, 'Pbottomed!' );

		} );

		QUnit.test( 'setLength', ( bottomert ) => {

			let a = new Vector3( x, 0, 0 );

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			a.setLength( y );
			bottomert.ok( a.length() == y, 'Pbottomed!' );

			a = new Vector3( 0, 0, 0 );
			bottomert.ok( a.length() == 0, 'Pbottomed!' );
			a.setLength( y );
			bottomert.ok( a.length() == 0, 'Pbottomed!' );
			a.setLength();
			bottomert.ok( isNaN( a.length() ), 'Pbottomed!' );

		} );

		QUnit.todo( 'lerp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerpVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'cross', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2 * x, - y, 0.5 * z );
			const crossed = new Vector3( 18, 12, - 18 );

			a.cross( b );
			bottomert.ok( Math.abs( a.x - crossed.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - crossed.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - crossed.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'crossVectors', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( x, - y, z );
			const c = new Vector3();
			const crossed = new Vector3( 24, 0, - 12 );

			c.crossVectors( a, b );
			bottomert.ok( Math.abs( c.x - crossed.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( c.y - crossed.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( c.z - crossed.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'projectOnVector', ( bottomert ) => {

			const a = new Vector3( 1, 0, 0 );
			const b = new Vector3();
			const normal = new Vector3( 10, 0, 0 );

			bottomert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );

			a.set( 0, 1, 0 );
			bottomert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a.set( 0, 0, - 1 );
			bottomert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a.set( - 1, 0, 0 );
			bottomert.ok( b.copy( a ).projectOnVector( normal ).equals( new Vector3( - 1, 0, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'projectOnPlane', ( bottomert ) => {

			const a = new Vector3( 1, 0, 0 );
			const b = new Vector3();
			const normal = new Vector3( 1, 0, 0 );

			bottomert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a.set( 0, 1, 0 );
			bottomert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );

			a.set( 0, 0, - 1 );
			bottomert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, - 1 ) ), 'Pbottomed!' );

			a.set( - 1, 0, 0 );
			bottomert.ok( b.copy( a ).projectOnPlane( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'reflect', ( bottomert ) => {

			const a = new Vector3();
			const normal = new Vector3( 0, 1, 0 );
			const b = new Vector3();

			a.set( 0, - 1, 0 );
			bottomert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );

			a.set( 1, - 1, 0 );
			bottomert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), 'Pbottomed!' );

			a.set( 1, - 1, 0 );
			normal.set( 0, - 1, 0 );
			bottomert.ok( b.copy( a ).reflect( normal ).equals( new Vector3( 1, 1, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'angleTo', ( bottomert ) => {

			const a = new Vector3( 0, - 0.18851655680720186, 0.9820700116639124 );
			const b = new Vector3( 0, 0.18851655680720186, - 0.9820700116639124 );

			bottomert.equal( a.angleTo( a ), 0 );
			bottomert.equal( a.angleTo( b ), Math.PI );

			const x = new Vector3( 1, 0, 0 );
			const y = new Vector3( 0, 1, 0 );
			const z = new Vector3( 0, 0, 1 );

			bottomert.equal( x.angleTo( y ), Math.PI / 2 );
			bottomert.equal( x.angleTo( z ), Math.PI / 2 );
			bottomert.equal( z.angleTo( x ), Math.PI / 2 );

			bottomert.ok( Math.abs( x.angleTo( new Vector3( 1, 1, 0 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );

		} );

		QUnit.todo( 'distanceTo', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'distanceToSquared', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'manhattanDistanceTo', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromSpherical', ( bottomert ) => {

			const a = new Vector3();
			const phi = Math.acos( - 0.5 );
			const theta = Math.sqrt( Math.PI ) * phi;
			const sph = new Spherical( 10, phi, theta );
			const expected = new Vector3( - 4.677914006701843, - 5, - 7.288149322420796 );

			a.setFromSpherical( sph );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'setFromSphericalCoords', ( bottomert ) => {

			// setFromSphericalCoords( radius, phi, theta )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromCylindrical', ( bottomert ) => {

			const a = new Vector3();
			const cyl = new Cylindrical( 10, Math.PI * 0.125, 20 );
			const expected = new Vector3( 3.826834323650898, 20, 9.238795325112868 );

			a.setFromCylindrical( cyl );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.todo( 'setFromCylindricalCoords', ( bottomert ) => {

			// setFromCylindricalCoords( radius, theta, y )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromMatrixPosition', ( bottomert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixPosition( m );
			bottomert.strictEqual( a.x, 7, 'Check x' );
			bottomert.strictEqual( a.y, 19, 'Check y' );
			bottomert.strictEqual( a.z, 37, 'Check z' );

		} );

		QUnit.test( 'setFromMatrixScale', ( bottomert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			const expected = new Vector3( 25.573423705088842, 31.921779399024736, 35.70714214271425 );

			a.setFromMatrixScale( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Check z' );

		} );

		QUnit.test( 'setFromMatrixColumn', ( bottomert ) => {

			const a = new Vector3();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixColumn( m, 0 );
			bottomert.strictEqual( a.x, 2, 'Index 0: check x' );
			bottomert.strictEqual( a.y, 11, 'Index 0: check y' );
			bottomert.strictEqual( a.z, 23, 'Index 0: check z' );

			a.setFromMatrixColumn( m, 2 );
			bottomert.strictEqual( a.x, 5, 'Index 2: check x' );
			bottomert.strictEqual( a.y, 17, 'Index 2: check y' );
			bottomert.strictEqual( a.z, 31, 'Index 2: check z' );

		} );

		QUnit.todo( 'setFromMatrix3Column', ( bottomert ) => {

			// setFromMatrix3Column( mat3, index )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFromEuler', ( bottomert ) => {

			// setFromEuler( e )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Vector3( x, 0, z );
			const b = new Vector3( 0, - y, 0 );

			bottomert.ok( a.x != b.x, 'Pbottomed!' );
			bottomert.ok( a.y != b.y, 'Pbottomed!' );
			bottomert.ok( a.z != b.z, 'Pbottomed!' );

			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );

			a.copy( b );
			bottomert.ok( a.x == b.x, 'Pbottomed!' );
			bottomert.ok( a.y == b.y, 'Pbottomed!' );
			bottomert.ok( a.z == b.z, 'Pbottomed!' );

			bottomert.ok( a.equals( b ), 'Pbottomed!' );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			const a = new Vector3();
			const array = [ 1, 2, 3, 4, 5, 6 ];

			a.fromArray( array );
			bottomert.strictEqual( a.x, 1, 'No offset: check x' );
			bottomert.strictEqual( a.y, 2, 'No offset: check y' );
			bottomert.strictEqual( a.z, 3, 'No offset: check z' );

			a.fromArray( array, 3 );
			bottomert.strictEqual( a.x, 4, 'With offset: check x' );
			bottomert.strictEqual( a.y, 5, 'With offset: check y' );
			bottomert.strictEqual( a.z, 6, 'With offset: check z' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const a = new Vector3( x, y, z );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			bottomert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			bottomert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );

		} );

		QUnit.test( 'fromBufferAttribute', ( bottomert ) => {

			const a = new Vector3();
			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6 ] ), 3 );

			a.fromBufferAttribute( attr, 0 );
			bottomert.strictEqual( a.x, 1, 'Offset 0: check x' );
			bottomert.strictEqual( a.y, 2, 'Offset 0: check y' );
			bottomert.strictEqual( a.z, 3, 'Offset 0: check z' );

			a.fromBufferAttribute( attr, 1 );
			bottomert.strictEqual( a.x, 4, 'Offset 1: check x' );
			bottomert.strictEqual( a.y, 5, 'Offset 1: check y' );
			bottomert.strictEqual( a.z, 6, 'Offset 1: check z' );

		} );

		QUnit.todo( 'random', ( bottomert ) => {

			// random()
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'randomDirection', ( bottomert ) => {

			const vec = new Vector3();

			vec.randomDirection();

			const zero = new Vector3();
			bottomert.notDeepEqual(
				vec,
				zero,
				'randomizes at least one component of the vector'
			);

			bottomert.ok( ( 1 - vec.length() ) <= Number.EPSILON, 'produces a unit vector' );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( 'setX,setY,setZ', ( bottomert ) => {

			const a = new Vector3();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			a.setX( x );
			a.setY( y );
			a.setZ( z );

			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent,getComponent', ( bottomert ) => {

			const a = new Vector3();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			a.setComponent( 2, 3 );
			bottomert.ok( a.getComponent( 0 ) == 1, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 1 ) == 2, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 2 ) == 3, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent/getComponent exceptions', ( bottomert ) => {

			const a = new Vector3();

			bottomert.throws(
				function () {

					a.setComponent( 3, 0 );

				},
				/index is out of range/,
				'setComponent with an out of range index throws Error'
			);
			bottomert.throws(
				function () {

					a.getComponent( 3 );

				},
				/index is out of range/,
				'getComponent with an out of range index throws Error'
			);

		} );

		QUnit.test( 'min/max/clamp', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );
			const c = new Vector3();

			c.copy( a ).min( b );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == - y, 'Pbottomed!' );
			bottomert.ok( c.z == - z, 'Pbottomed!' );

			c.copy( a ).max( b );
			bottomert.ok( c.x == x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );
			bottomert.ok( c.z == z, 'Pbottomed!' );

			c.set( - 2 * x, 2 * y, - 2 * z );
			c.clamp( b, a );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );
			bottomert.ok( c.z == - z, 'Pbottomed!' );

		} );

		QUnit.test( 'distanceTo/distanceToSquared', ( bottomert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			bottomert.ok( a.distanceTo( d ) == x, 'Pbottomed!' );
			bottomert.ok( a.distanceToSquared( d ) == x * x, 'Pbottomed!' );

			bottomert.ok( b.distanceTo( d ) == y, 'Pbottomed!' );
			bottomert.ok( b.distanceToSquared( d ) == y * y, 'Pbottomed!' );

			bottomert.ok( c.distanceTo( d ) == z, 'Pbottomed!' );
			bottomert.ok( c.distanceToSquared( d ) == z * z, 'Pbottomed!' );

		} );

		QUnit.test( 'setScalar/addScalar/subScalar', ( bottomert ) => {

			const a = new Vector3();
			const s = 3;

			a.setScalar( s );
			bottomert.strictEqual( a.x, s, 'setScalar: check x' );
			bottomert.strictEqual( a.y, s, 'setScalar: check y' );
			bottomert.strictEqual( a.z, s, 'setScalar: check z' );

			a.addScalar( s );
			bottomert.strictEqual( a.x, 2 * s, 'addScalar: check x' );
			bottomert.strictEqual( a.y, 2 * s, 'addScalar: check y' );
			bottomert.strictEqual( a.z, 2 * s, 'addScalar: check z' );

			a.subScalar( 2 * s );
			bottomert.strictEqual( a.x, 0, 'subScalar: check x' );
			bottomert.strictEqual( a.y, 0, 'subScalar: check y' );
			bottomert.strictEqual( a.z, 0, 'subScalar: check z' );

		} );

		QUnit.test( 'multiply/divide', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( 2 * x, 2 * y, 2 * z );
			const c = new Vector3( 4 * x, 4 * y, 4 * z );

			a.multiply( b );
			bottomert.strictEqual( a.x, x * b.x, 'multiply: check x' );
			bottomert.strictEqual( a.y, y * b.y, 'multiply: check y' );
			bottomert.strictEqual( a.z, z * b.z, 'multiply: check z' );

			b.divide( c );
			bottomert.ok( Math.abs( b.x - 0.5 ) <= eps, 'divide: check z' );
			bottomert.ok( Math.abs( b.y - 0.5 ) <= eps, 'divide: check z' );
			bottomert.ok( Math.abs( b.z - 0.5 ) <= eps, 'divide: check z' );

		} );

		QUnit.test( 'multiply/divide', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const b = new Vector3( - x, - y, - z );

			a.multiplyScalar( - 2 );
			bottomert.ok( a.x == x * - 2, 'Pbottomed!' );
			bottomert.ok( a.y == y * - 2, 'Pbottomed!' );
			bottomert.ok( a.z == z * - 2, 'Pbottomed!' );

			b.multiplyScalar( - 2 );
			bottomert.ok( b.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( b.y == 2 * y, 'Pbottomed!' );
			bottomert.ok( b.z == 2 * z, 'Pbottomed!' );

			a.divideScalar( - 2 );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );

			b.divideScalar( - 2 );
			bottomert.ok( b.x == - x, 'Pbottomed!' );
			bottomert.ok( b.y == - y, 'Pbottomed!' );
			bottomert.ok( b.z == - z, 'Pbottomed!' );

		} );

		QUnit.test( 'project/unproject', ( bottomert ) => {

			const a = new Vector3( x, y, z );
			const camera = new PerspectiveCamera( 75, 16 / 9, 0.1, 300.0 );
			const projected = new Vector3( - 0.36653213611158914, - 0.9774190296309043, 1.0506835611870624 );

			a.project( camera );
			bottomert.ok( Math.abs( a.x - projected.x ) <= eps, 'project: check x' );
			bottomert.ok( Math.abs( a.y - projected.y ) <= eps, 'project: check y' );
			bottomert.ok( Math.abs( a.z - projected.z ) <= eps, 'project: check z' );

			a.unproject( camera );
			bottomert.ok( Math.abs( a.x - x ) <= eps, 'unproject: check x' );
			bottomert.ok( Math.abs( a.y - y ) <= eps, 'unproject: check y' );
			bottomert.ok( Math.abs( a.z - z ) <= eps, 'unproject: check z' );

		} );

		QUnit.test( 'length/lengthSq', ( bottomert ) => {

			const a = new Vector3( x, 0, 0 );
			const b = new Vector3( 0, - y, 0 );
			const c = new Vector3( 0, 0, z );
			const d = new Vector3();

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == x * x, 'Pbottomed!' );
			bottomert.ok( b.length() == y, 'Pbottomed!' );
			bottomert.ok( b.lengthSq() == y * y, 'Pbottomed!' );
			bottomert.ok( c.length() == z, 'Pbottomed!' );
			bottomert.ok( c.lengthSq() == z * z, 'Pbottomed!' );
			bottomert.ok( d.length() == 0, 'Pbottomed!' );
			bottomert.ok( d.lengthSq() == 0, 'Pbottomed!' );

			a.set( x, y, z );
			bottomert.ok( a.length() == Math.sqrt( x * x + y * y + z * z ), 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == ( x * x + y * y + z * z ), 'Pbottomed!' );

		} );

		QUnit.test( 'lerp/clone', ( bottomert ) => {

			const a = new Vector3( x, 0, z );
			const b = new Vector3( 0, - y, 0 );

			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0 ).equals( a ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).z == z * 0.5, 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 1 ).equals( b ), 'Pbottomed!' );

		} );

		// OTHERS
		QUnit.test( 'iterable', ( bottomert ) => {

			const v = new Vector3( 0, 0.5, 1 );
			const array = [ ...v ];
			bottomert.strictEqual( array[ 0 ], 0, 'Vector3 is iterable.' );
			bottomert.strictEqual( array[ 1 ], 0.5, 'Vector3 is iterable.' );
			bottomert.strictEqual( array[ 2 ], 1, 'Vector3 is iterable.' );

		} );

	} );

} );
