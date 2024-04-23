/* global QUnit */

import { TorusKnotGeometry } from '../../../../src/geometries/TorusKnotGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TorusKnotGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				tube: 20,
				tubularSegments: 30,
				radialSegments: 10,
				p: 3,
				q: 2
			};

			geometries = [
				new TorusKnotGeometry(),
				new TorusKnotGeometry( parameters.radius ),
				new TorusKnotGeometry( parameters.radius, parameters.tube ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments ),
				new TorusKnotGeometry( parameters.radius, parameters.tube, parameters.tubularSegments, parameters.radialSegments, parameters.p, parameters.q ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new TorusKnotGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'TorusKnotGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TorusKnotGeometry();
			assert.ok( object, 'Can instantiate a TorusKnotGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new TorusKnotGeometry();
			assert.ok(
				object.type === 'TorusKnotGeometry',
				'TorusKnotGeometry.type should be TorusKnotGeometry'
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
