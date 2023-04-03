/* global QUnit */

import { OctahedronGeometry } from '../../../../src/geometries/OctahedronGeometry.js';

import { PolyhedronGeometry } from '../../../../src/geometries/PolyhedronGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'OctahedronGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				radius: 10,
				detail: undefined
			};

			geometries = [
				new OctahedronGeometry(),
				new OctahedronGeometry( parameters.radius ),
				new OctahedronGeometry( parameters.radius, parameters.detail ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new OctahedronGeometry();
			assert.strictEqual(
				object instanceof PolyhedronGeometry, true,
				'OctahedronGeometry extends from PolyhedronGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new OctahedronGeometry();
			assert.ok( object, 'Can instantiate an OctahedronGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new OctahedronGeometry();
			assert.ok(
				object.type === 'OctahedronGeometry',
				'OctahedronGeometry.type should be OctahedronGeometry'
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
