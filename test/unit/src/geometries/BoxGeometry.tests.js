/* global QUnit */

import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';

import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'BoxGeometry', ( hooks ) => {

		let geometries = undefined;
		hooks.beforeEach( function () {

			const parameters = {
				width: 10,
				height: 20,
				depth: 30,
				widthSegments: 2,
				heightSegments: 3,
				depthSegments: 4
			};

			geometries = [
				new BoxGeometry(),
				new BoxGeometry( parameters.width, parameters.height, parameters.depth ),
				new BoxGeometry( parameters.width, parameters.height, parameters.depth, parameters.widthSegments, parameters.heightSegments, parameters.depthSegments ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new BoxGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'BoxGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new BoxGeometry();
			bottomert.ok( object, 'Can instantiate a BoxGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new BoxGeometry();
			bottomert.ok(
				object.type === 'BoxGeometry',
				'BoxGeometry.type should be BoxGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( bottomert ) => {

			runStdGeometryTests( bottomert, geometries );

		} );

	} );

} );
