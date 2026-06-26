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
		QUnit.test( 'Extending', ( assert ) => {

			const object = new BoxGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'BoxGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new BoxGeometry();
			assert.ok( object, 'Can instantiate a BoxGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new BoxGeometry();
			assert.ok(
				object.type === 'BoxGeometry',
				'BoxGeometry.type should be BoxGeometry'
			);

		} );

		// OTHERS
		QUnit.test( 'Standard geometry tests', ( assert ) => {

			runStdGeometryTests( assert, geometries );

		} );

		QUnit.test( 'toJSON: parametric serialization for untransformed geometry', ( assert ) => {

			const geometry = new BoxGeometry( 10, 20, 30 );
			const json = geometry.toJSON();

			assert.strictEqual( geometry._transformed, false, '_transformed defaults to false' );
			assert.strictEqual( json.type, 'BoxGeometry', 'type is preserved' );
			assert.strictEqual( json.width, 10, 'width is serialized' );
			assert.strictEqual( json.height, 20, 'height is serialized' );
			assert.strictEqual( json.depth, 30, 'depth is serialized' );
			assert.strictEqual( json.data, undefined, 'attribute data is not serialized' );

		} );

		QUnit.test( 'toJSON: attribute serialization after translate()', ( assert ) => {

			const geometry = new BoxGeometry( 10, 20, 30 );
			geometry.translate( 1, 2, 3 );
			const json = geometry.toJSON();

			assert.strictEqual( geometry._transformed, true, '_transformed is true after translate()' );
			assert.strictEqual( json.type, 'BufferGeometry', 'type is downgraded to BufferGeometry' );
			assert.strictEqual( json.width, undefined, 'parameters are not serialized' );
			assert.ok( json.data && json.data.attributes && json.data.attributes.position, 'attribute data is serialized' );

		} );

		QUnit.test( 'toJSON: clone of a transformed geometry preserves _transformed', ( assert ) => {

			const source = new BoxGeometry( 10, 20, 30 );
			source.translate( 1, 2, 3 );
			const clone = source.clone();
			const json = clone.toJSON();

			assert.strictEqual( clone._transformed, true, '_transformed propagates through copy()' );
			assert.strictEqual( json.type, 'BufferGeometry', 'cloned type is downgraded to BufferGeometry' );
			assert.ok( json.data && json.data.attributes && json.data.attributes.position, 'cloned attribute data is serialized' );

		} );

	} );

} );
