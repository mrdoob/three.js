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

		// PUBLIC
		QUnit.test( 'fromJSON', ( assert ) => {

			const geometry = new TorusGeometry( 1, 0.4, 12, 48, Math.PI, 0.3, 1.1 );
			const geometry2 = TorusGeometry.fromJSON( geometry.toJSON() );

			assert.deepEqual(
				geometry2.parameters, geometry.parameters,
				'fromJSON() restores all parameters, including thetaStart and thetaLength'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
