/* global QUnit */

import { Cylindrical } from '../../../../src/math/Cylindrical.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { eps } from './Constants.tests.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Cylindrical', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			var a = new Cylindrical();
			var radius = 10.0;
			var theta = Math.PI;
			var y = 5;

			assert.strictEqual( a.radius, 1.0, 'Default values: check radius' );
			assert.strictEqual( a.theta, 0, 'Default values: check theta' );
			assert.strictEqual( a.y, 0, 'Default values: check y' );

			var a = new Cylindrical( radius, theta, y );
			assert.strictEqual( a.radius, radius, 'Custom values: check radius' );
			assert.strictEqual( a.theta, theta, 'Custom values: check theta' );
			assert.strictEqual( a.y, y, 'Custom values: check y' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'set', ( assert ) => {

			var a = new Cylindrical();
			var radius = 10.0;
			var theta = Math.PI;
			var y = 5;

			a.set( radius, theta, y );
			assert.strictEqual( a.radius, radius, 'Check radius' );
			assert.strictEqual( a.theta, theta, 'Check theta' );
			assert.strictEqual( a.y, y, 'Check y' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			var radius = 10.0;
			var theta = Math.PI;
			var y = 5;
			var a = new Cylindrical( radius, theta, y );
			var b = a.clone();

			assert.propEqual( a, b, 'Check a and b are equal after clone()' );

			a.radius = 1;
			assert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			var radius = 10.0;
			var theta = Math.PI;
			var y = 5;
			var a = new Cylindrical( radius, theta, y );
			var b = new Cylindrical().copy( a );

			assert.propEqual( a, b, 'Check a and b are equal after copy()' );

			a.radius = 1;
			assert.notPropEqual( a, b, 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'setFromVector3', ( assert ) => {

			var a = new Cylindrical( 1, 1, 1 );
			var b = new Vector3( 0, 0, 0 );
			var c = new Vector3( 3, - 1, - 3 );
			var expected = new Cylindrical( Math.sqrt( 9 + 9 ), Math.atan2( 3, - 3 ), - 1 );

			a.setFromVector3( b );
			assert.strictEqual( a.radius, 0, 'Zero-length vector: check radius' );
			assert.strictEqual( a.theta, 0, 'Zero-length vector: check theta' );
			assert.strictEqual( a.y, 0, 'Zero-length vector: check y' );

			a.setFromVector3( c );
			assert.ok( Math.abs( a.radius - expected.radius ) <= eps, 'Normal vector: check radius' );
			assert.ok( Math.abs( a.theta - expected.theta ) <= eps, 'Normal vector: check theta' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Normal vector: check y' );

		} );

	} );

} );
