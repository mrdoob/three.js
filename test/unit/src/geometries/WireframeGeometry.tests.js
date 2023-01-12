/* global QUnit */

import { WireframeGeometry } from '../../../../src/geometries/WireframeGeometry.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'WireframeGeometry', ( hooks ) => {

		var geometries = undefined; // eslint-disable-line no-unused-vars
		hooks.beforeEach( function () {

			geometries = [
				new WireframeGeometry()
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
		QUnit.todo( 'Standard geometry tests', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
