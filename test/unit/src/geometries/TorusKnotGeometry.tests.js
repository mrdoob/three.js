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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new TorusKnotGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'TorusKnotGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new TorusKnotGeometry();
			bottomert.ok( object, 'Can instantiate a TorusKnotGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new TorusKnotGeometry();
			bottomert.ok(
				object.type === 'TorusKnotGeometry',
				'TorusKnotGeometry.type should be TorusKnotGeometry'
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
