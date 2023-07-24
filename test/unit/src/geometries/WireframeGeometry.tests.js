/* global QUnit */

import { WireframeGeometry } from '../../../../src/geometries/WireframeGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'WireframeGeometry', ( hooks ) => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		hooks.beforeEach( function () {

			geometries = [
				new WireframeGeometry()
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new WireframeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'WireframeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new WireframeGeometry();
			assert.ok( object, 'Can instantiate a WireframeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new WireframeGeometry();
			assert.ok(
				object.type === 'WireframeGeometry',
				'WireframeGeometry.type should be WireframeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.todo( 'Standard geometry tests', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
