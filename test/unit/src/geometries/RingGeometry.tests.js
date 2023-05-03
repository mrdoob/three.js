/* global QUnit */

import { RingGeometry } from '../../../../src/geometries/RingGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'RingGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				innerRadius: 10,
				outerRadius: 60,
				thetaSegments: 12,
				phiSegments: 14,
				thetaStart: 0.1,
				thetaLength: 2.0
			};

			geometries = [
				new RingGeometry(),
				new RingGeometry( parameters.innerRadius ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart ),
				new RingGeometry( parameters.innerRadius, parameters.outerRadius, parameters.thetaSegments, parameters.phiSegments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new RingGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'RingGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new RingGeometry();
			assert.ok( object, 'Can instantiate a RingGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new RingGeometry();
			assert.ok(
				object.type === 'RingGeometry',
				'RingGeometry.type should be RingGeometry'
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
