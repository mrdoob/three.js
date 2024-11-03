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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ConeGeometry();
			bottomert.strictEqual(
				object instanceof CylinderGeometry, true,
				'ConeGeometry extends from CylinderGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ConeGeometry();
			bottomert.ok( object, 'Can instantiate a ConeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new ConeGeometry();
			bottomert.ok(
				object.type === 'ConeGeometry',
				'ConeGeometry.type should be ConeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( bottomert ) => {

			runStdGeometryTests( bottomert, geometries );

		} );

	} );

} );
