/* global QUnit */

import { DodecahedronGeometry } from '../../../../src/geometries/DodecahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'DodecahedronGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new DodecahedronGeometry(),
				new DodecahedronGeometry( parameters.radius ),
				new DodecahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new DodecahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'DodecahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new DodecahedronGeometry();
			assert.ok( object, 'Can instantiate a DodecahedronGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new DodecahedronGeometry();
			assert.ok(
				object.type === 'DodecahedronGeometry',
				'DodecahedronGeometry.type should be DodecahedronGeometry'
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
