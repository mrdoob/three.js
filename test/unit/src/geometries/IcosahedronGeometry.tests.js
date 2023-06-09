/* global QUnit */

import { IcosahedronGeometry } from '../../../../src/geometries/IcosahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'IcosahedronGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new IcosahedronGeometry(),
				new IcosahedronGeometry( parameters.radius ),
				new IcosahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new IcosahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'IcosahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new IcosahedronGeometry();
			assert.ok( object, 'Can instantiate an IcosahedronGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new IcosahedronGeometry();
			assert.ok(
				object.type === 'IcosahedronGeometry',
				'IcosahedronGeometry.type should be IcosahedronGeometry'
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
