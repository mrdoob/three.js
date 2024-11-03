/* global QUnit */

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
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new ShapeGeometry();
			bottomert.strictEqual(
				object instanceof BufferGeometry, true,
				'ShapeGeometry extends from BufferGeometry'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new ShapeGeometry();
			bottomert.ok( object, 'Can instantiate a ShapeGeometry.' );

		} );

		// PROPERTIES
		QUnit.test( 'type', ( bottomert ) => {

			const object = new ShapeGeometry();
			bottomert.ok(
				object.type === 'ShapeGeometry',
				'ShapeGeometry.type should be ShapeGeometry'
			);

		} );

		QUnit.todo( 'parameters', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// STATIC
		QUnit.todo( 'fromJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.todo( 'Standard geometry tests', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
