/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { CircleGeometry, CircleBufferGeometry } from '../../../../src/geometries/CircleGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleGeometry', ( hooks ) => {

		var geometries = undefined;
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
				new CircleBufferGeometry(),
			];

		} );

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.todo( 'Instancing', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
