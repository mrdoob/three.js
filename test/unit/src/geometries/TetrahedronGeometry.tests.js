/* global QUnit */

import { TetrahedronGeometry } from '../../../../src/geometries/TetrahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'TetrahedronGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new TetrahedronGeometry(),
				new TetrahedronGeometry( parameters.radius ),
				new TetrahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new TetrahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'TetrahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new TetrahedronGeometry();
			assert.ok( object, 'Can instantiate a TetrahedronGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new TetrahedronGeometry();
			assert.ok(
				object.type === 'TetrahedronGeometry',
				'TetrahedronGeometry.type should be TetrahedronGeometry'
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
