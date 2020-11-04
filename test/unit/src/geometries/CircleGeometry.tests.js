/* global QUnit */

import { runStdGeometryTests } from '../../utils/qunit-utils';
import { CircleBufferGeometry } from '../../../../src/geometries/CircleBufferGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'CircleBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				segments: 20,
				thetaStart: 0.1,
				thetaLength: 0.2
			};

			geometries = [
				new CircleBufferGeometry(),
				new CircleBufferGeometry( parameters.radius ),
				new CircleBufferGeometry( parameters.radius, parameters.segments ),
				new CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart ),
				new CircleBufferGeometry( parameters.radius, parameters.segments, parameters.thetaStart, parameters.thetaLength ),
			];

		} );

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

	} );

} );
