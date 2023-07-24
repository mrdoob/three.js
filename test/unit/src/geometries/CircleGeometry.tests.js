/* global QUnit */

import { CircleGeometry } from '../../../../src/geometries/CircleGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			geometries = [
				new CircleGeometry(),
				new CircleGeometry( parameters.radius ),
				new CircleGeometry( parameters.radius, parameters.segments ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new CircleGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'CircleGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new CircleGeometry();
			assert.ok( object, 'Can instantiate a CircleGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new CircleGeometry();
			assert.ok(
				object.type === 'CircleGeometry',
				'CircleGeometry.type should be CircleGeometry'
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
