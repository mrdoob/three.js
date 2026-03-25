import { ShapeGeometry } from '../../../../src/geometries/ShapeGeometry.js';

import { Shape } from '../../../../src/extras/core/Shape.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
// import { runStdGeometryTests } from '../../utils/qunit-utils.js';

export default QUnit.module( 'Geometries', () => {

	QUnit.module( 'ShapeGeometry', ( hooks ) => {

		let geometries = undefined; // eslint-disable-line no-unused-vars
		hooks.beforeEach( function () {

			const triangleShape = new Shape();
			triangleShape.moveTo( 0, - 1 );
			triangleShape.lineTo( 1, 1 );
			triangleShape.lineTo( - 1, 1 );

			geometries = [
				new ShapeGeometry( triangleShape ),
			];

		} );

		// INHERITANCE
		QUnit.test( 'Extending', ( assert ) => {

			const object = new ShapeGeometry();
			assert.strictEqual(
				object instanceof BufferGeometry, true,
				'ShapeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new ShapeGeometry();
			assert.ok( object, 'Can instantiate a ShapeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( assert ) => {

			const object = new ShapeGeometry();
			assert.ok(
				object.type === 'ShapeGeometry',
				'ShapeGeometry.type should be ShapeGeometry'
			);

		} );

	} );

} );
