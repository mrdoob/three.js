/* global QUnit */

import { PlaneGeometry } from '../../../../src/geometries/PlaneGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'PlaneGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 30,
				widthSegments: 3,
				heightSegments: 5
			};

			geometries = [
				new PlaneGeometry(),
				new PlaneGeometry( parameters.width ),
				new PlaneGeometry( parameters.width, parameters.height ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments ),
				new PlaneGeometry( parameters.width, parameters.height, parameters.widthSegments, parameters.heightSegments ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new PlaneGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'PlaneGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new PlaneGeometry();
			assert.ok( object, 'Can instantiate a PlaneGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new PlaneGeometry();
			assert.ok(
				object.type === 'PlaneGeometry',
				'PlaneGeometry.type should be PlaneGeometry'
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
