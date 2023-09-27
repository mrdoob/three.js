/* global QUnit */

import { TorusGeometry } from '../../../../src/geometries/TorusGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TorusGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				radialSegments: 30,
				tubularSegments: 10,
				arc: 2.0,
			};

			geometries = [
				new TorusGeometry(),
				new TorusGeometry( parameters.radius ),
				new TorusGeometry( parameters.radius, parameters.tube ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments ),
				new TorusGeometry( parameters.radius, parameters.tube, parameters.radialSegments, parameters.tubularSegments, parameters.arc ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new TorusGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TorusGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TorusGeometry();
			assert.ok( object, 'Can instantiate a TorusGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new TorusGeometry();
			assert.ok(
				object.type === 'TorusGeometry',
				'TorusGeometry.type should be TorusGeometry'
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
