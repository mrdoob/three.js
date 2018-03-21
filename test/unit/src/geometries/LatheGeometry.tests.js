/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { runStdGeometryTests } from '../../qunit-utils';
import {
	LatheGeometry,
	LatheBufferGeometry
} from '../../../../src/geometries/LatheGeometry';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'LatheGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				points: [],
				segments: 0,
				phiStart: 0,
				phiLength: 0
			};

			geometries = [
				//				new LatheGeometry(), // Todo: error for undefined point
				new LatheGeometry( parameters.points )
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

	QUnit.module( 'LatheBufferGeometry', ( hooks ) => {

		var geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				points: [],
				segments: 0,
				phiStart: 0,
				phiLength: 0
			};

			geometries = [
				//				new LatheBufferGeometry(), // Todo: error for undefined point
				new LatheBufferGeometry( parameters.points )
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
