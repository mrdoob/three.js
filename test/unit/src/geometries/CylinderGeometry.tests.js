/* global QUnit */

import { CylinderGeometry } from '../../../../src/geometries/CylinderGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CylinderGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radiusTop: 10,
				radiusBottom: 20,
				height: 30,
				radialSegments: 20,
				heightSegments: 30,
				openEnded: true,
				thetaStart: 0.1,
				thetaLength: 2.0,
			};

			geometries = [
				new CylinderGeometry(),
				new CylinderGeometry( parameters.radiusTop ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart ),
				new CylinderGeometry( parameters.radiusTop, parameters.radiusBottom, parameters.height, parameters.radialSegments, parameters.heightSegments, parameters.openEnded, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CylinderGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CylinderGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CylinderGeometry();
			assert.ok( object, 'Can instantiate a CylinderGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new CylinderGeometry();
			assert.ok(
				object.type === 'CylinderGeometry',
				'CylinderGeometry.type should be CylinderGeometry'
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
