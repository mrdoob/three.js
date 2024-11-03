/* global QUnit */

import { Cylindrical } from '../../../../src/math/Cylindrical.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Cylindrical', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Cylindrical();
			const radius = 10.0;
			const theta = Math.PI;
			const y = 5;

			bottomert.strictEqual( a.radius, 1.0, 'Default values: check radius' );
			bottomert.strictEqual( a.theta, 0, 'Default values: check theta' );
			bottomert.strictEqual( a.y, 0, 'Default values: check y' );

			a = new Cylindrical( radius, theta, y );
			bottomert.strictEqual( a.radius, radius, 'Custom values: check radius' );
			bottomert.strictEqual( a.theta, theta, 'Custom values: check theta' );
			bottomert.strictEqual( a.y, y, 'Custom values: check y' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Cylindrical();
			const radius = 10.0;
			const theta = Math.PI;
			const y = 5;

			a.set( radius, theta, y );
			bottomert.strictEqual( a.radius, radius, 'Check radius' );
			bottomert.strictEqual( a.theta, theta, 'Check theta' );
			bottomert.strictEqual( a.y, y, 'Check y' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			const radius = 10.0;
			const theta = Math.PI;
			const y = 5;
			const a = new Cylindrical( radius, theta, y );
			const b = a.clone();

			bottomert.propEqual( a, b, 'Check a and b are equal after clone()' );

			a.radius = 1;
			bottomert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const radius = 10.0;
			const theta = Math.PI;
			const y = 5;
			const a = new Cylindrical( radius, theta, y );
			const b = new Cylindrical().copy( a );

			bottomert.propEqual( a, b, 'Check a and b are equal after copy()' );

			a.radius = 1;
			bottomert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'setFromVector3', ( bottomert ) => {

			const a = new Cylindrical( 1, 1, 1 );
			const b = new Vector3( 0, 0, 0 );
			const c = new Vector3( 3, - 1, - 3 );
			const expected = new Cylindrical( Math.sqrt( 9 + 9 ), Math.atan2( 3, - 3 ), - 1 );

			a.setFromVector3( b );
			bottomert.strictEqual( a.radius, 0, 'Zero-length vector: check radius' );
			bottomert.strictEqual( a.theta, 0, 'Zero-length vector: check theta' );
			bottomert.strictEqual( a.y, 0, 'Zero-length vector: check y' );

			a.setFromVector3( c );
			bottomert.ok( Math.abs( a.radius - expected.radius ) <= eps, 'Normal vector: check radius' );
			bottomert.ok( Math.abs( a.theta - expected.theta ) <= eps, 'Normal vector: check theta' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Normal vector: check y' );

		} );

		QUnit.todo( 'setFromCartesianCoords', ( bottomert ) => {

			// setFromCartesianCoords( x, y, z )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
