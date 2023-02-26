/* global QUnit */

import { BoxHelper } from '../../../../src/helpers/BoxHelper.js';

import { LineSegments } from '../../../../src/objects/LineSegments.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';
import { Mesh } from '../../../../src/objects/Mesh.js';

export default QUnit.module( 'Helpers', () => {

	QUnit.module( 'BoxHelper', ( hooks ) => {

		let geometries = undefined;

		hooks.beforeEach( function () {

			// Test with a normal cube and a box helper
			const boxGeometry = new BoxGeometry();
			const box = new Mesh( boxGeometry );
			const boxHelper = new BoxHelper( box );

			// The same should happen with a comparable sphere
			const sphereGeometry = new SphereGeometry();
			const sphere = new Mesh( sphereGeometry );
			const sphereBoxHelper = new BoxHelper( sphere );

			// Note that unlike what I'd like to, these doesn't check the equivalency
			// of the two generated geometries
			geometries = [ boxHelper.geometry, sphereBoxHelper.geometry ];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new BoxHelper();
			assert.strictEqual(
				object instanceof LineSegments, true,
				'BoxHelper extends from LineSegments'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new BoxHelper();
			assert.ok( object, 'Can instantiate a BoxHelper.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new BoxHelper();
			assert.ok(
				object.type === 'BoxHelper',
				'BoxHelper.type should be BoxHelper'
			);

		} );

		QUnit.todo( 'object', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'matrixAutoUpdate', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'update', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setFromObject', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'copy', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'dispose', ( assert ) => {

			assert.expect( 0 );

			const object = new BoxHelper();
			object.dispose();

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
