/* global QUnit */

import { ConeGeometry } from '../../../../src/geometries/ConeGeometry.js';

import { CylinderGeometry } from '../../../../src/geometries/CylinderGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ConeGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			geometries = [
				new ConeGeometry(),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ConeGeometry();
			assert.strictEqual(
				object instanceof CylinderGeometry, true,
				'ConeGeometry extends from CylinderGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ConeGeometry();
			assert.ok( object, 'Can instantiate a ConeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ConeGeometry();
			assert.ok(
				object.type === 'ConeGeometry',
				'ConeGeometry.type should be ConeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
